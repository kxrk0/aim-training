import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { verifyFirebaseToken } from '../middleware/firebaseAuth'

const router = Router()
const prisma = new PrismaClient()

// Apply authentication middleware to all routes
router.use(verifyFirebaseToken)

// Get all available rewards
router.get('/', async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: [
        { rarity: 'asc' },
        { type: 'asc' },
        { name: 'asc' }
      ]
    })
    
    res.json({ success: true, data: rewards })
  } catch (error) {
    console.error('Failed to fetch rewards:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch rewards' })
  }
})

// Get user's unlocked rewards
router.get('/user', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const userRewards = await prisma.userReward.findMany({
      where: { userId },
      include: {
        reward: true
      },
      orderBy: [
        { isEquipped: 'desc' },
        { unlockedAt: 'desc' }
      ]
    })
    
    res.json({ success: true, data: userRewards })
  } catch (error) {
    console.error('Failed to fetch user rewards:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch user rewards' })
  }
})

// Get equipped rewards
router.get('/user/equipped', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const equippedRewards = await prisma.userReward.findMany({
      where: { 
        userId,
        isEquipped: true 
      },
      include: {
        reward: true
      }
    })
    
    res.json({ success: true, data: equippedRewards })
  } catch (error) {
    console.error('Failed to fetch equipped rewards:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch equipped rewards' })
  }
})

// Claim a reward (manual claiming)
router.post('/:rewardId/claim', async (req, res) => {
  try {
    const userId = req.user?.id
    const { rewardId } = req.params
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Check if reward exists
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId }
    })

    if (!reward) {
      return res.status(404).json({ success: false, error: 'Reward not found' })
    }

    // Check if user already has this reward
    const existingUserReward = await prisma.userReward.findUnique({
      where: { userId_rewardId: { userId, rewardId } }
    })

    if (existingUserReward) {
      return res.status(400).json({ success: false, error: 'Reward already claimed' })
    }

    // Create user reward
    const userReward = await prisma.userReward.create({
      data: {
        userId,
        rewardId
      },
      include: {
        reward: true
      }
    })
    
    res.json({ success: true, data: userReward })
  } catch (error) {
    console.error('Failed to claim reward:', error)
    res.status(500).json({ success: false, error: 'Failed to claim reward' })
  }
})

// Equip a reward
router.post('/:rewardId/equip', async (req, res) => {
  try {
    const userId = req.user?.id
    const { rewardId } = req.params
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Check if user owns this reward
    const userReward = await prisma.userReward.findUnique({
      where: { userId_rewardId: { userId, rewardId } },
      include: { reward: true }
    })

    if (!userReward) {
      return res.status(404).json({ success: false, error: 'Reward not owned' })
    }

    // Unequip other rewards of the same type first
    await prisma.userReward.updateMany({
      where: {
        userId,
        reward: {
          type: userReward.reward.type
        },
        isEquipped: true
      },
      data: {
        isEquipped: false
      }
    })

    // Equip this reward
    const updatedUserReward = await prisma.userReward.update({
      where: { id: userReward.id },
      data: { isEquipped: true },
      include: { reward: true }
    })
    
    res.json({ success: true, data: updatedUserReward })
  } catch (error) {
    console.error('Failed to equip reward:', error)
    res.status(500).json({ success: false, error: 'Failed to equip reward' })
  }
})

// Unequip a reward
router.post('/:rewardId/unequip', async (req, res) => {
  try {
    const userId = req.user?.id
    const { rewardId } = req.params
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Check if user owns this reward
    const userReward = await prisma.userReward.findUnique({
      where: { userId_rewardId: { userId, rewardId } }
    })

    if (!userReward) {
      return res.status(404).json({ success: false, error: 'Reward not owned' })
    }

    // Unequip the reward
    const updatedUserReward = await prisma.userReward.update({
      where: { id: userReward.id },
      data: { isEquipped: false },
      include: { reward: true }
    })
    
    res.json({ success: true, data: updatedUserReward })
  } catch (error) {
    console.error('Failed to unequip reward:', error)
    res.status(500).json({ success: false, error: 'Failed to unequip reward' })
  }
})

// Get rewards by type/category
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const rewards = await prisma.reward.findMany({
      where: {
        type,
        isActive: true
      },
      include: {
        userRewards: {
          where: { userId }
        }
      },
      orderBy: { rarity: 'asc' }
    })
    
    res.json({ success: true, data: rewards })
  } catch (error) {
    console.error('Failed to fetch rewards by type:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch rewards by type' })
  }
})

// Get reward statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const [totalRewards, unlockedRewards, equippedRewards] = await Promise.all([
      prisma.reward.count({ where: { isActive: true } }),
      prisma.userReward.count({ where: { userId } }),
      prisma.userReward.count({ where: { userId, isEquipped: true } })
    ])

    const rewardsByType = await prisma.userReward.groupBy({
      by: ['rewardId'],
      where: { userId },
      _count: { id: true }
    })

    const stats = {
      total: totalRewards,
      unlocked: unlockedRewards,
      equipped: equippedRewards,
      unlockedPercentage: totalRewards > 0 ? (unlockedRewards / totalRewards) * 100 : 0,
      byType: rewardsByType
    }
    
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Failed to fetch reward statistics:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch reward statistics' })
  }
})

export default router 