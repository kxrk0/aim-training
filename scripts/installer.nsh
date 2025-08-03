; Custom NSIS script for AIM TRAINER PRO
; This script will be included in the main installer

; Modern UI
!include "MUI2.nsh"
!include "FileFunc.nsh"

; Custom pages
!define MUI_WELCOMEPAGE_TITLE "AIM TRAINER PRO Kurulumuna Hoş Geldiniz"
!define MUI_WELCOMEPAGE_TEXT "Bu sihirbaz sizi AIM TRAINER PRO'nun kurulumu boyunca yönlendirecektir.$\r$\n$\r$\nProfesyonel FPS eğitimi için en gelişmiş platform."
!define MUI_FINISHPAGE_TITLE "AIM TRAINER PRO Başarıyla Kuruldu"
!define MUI_FINISHPAGE_TEXT "AIM TRAINER PRO başarıyla bilgisayarınıza kuruldu.$\r$\n$\r$\nEğitimlerle aim yeteneklerinizi geliştirin!"

; Custom finish page options
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "AIM TRAINER PRO'yu şimdi başlat"
!define MUI_FINISHPAGE_RUN_FUNCTION "LaunchApplication"

; Directory page
!define MUI_DIRECTORYPAGE_TEXT_TOP "Kurulum programı AIM TRAINER PRO'yu aşağıdaki klasöre kuracaktır. Farklı bir klasöre kurmak için Gözat'a tıklayın."

; Custom functions
Function LaunchApplication
  Exec '"$INSTDIR\AIM TRAINER PRO.exe"'
FunctionEnd

; Post install actions
Function .onInstSuccess
  ; Create desktop shortcut with custom icon
  CreateShortcut "$DESKTOP\AIM TRAINER PRO.lnk" "$INSTDIR\AIM TRAINER PRO.exe" "" "$INSTDIR\resources\assets\icon.ico" 0
  
  ; Create start menu shortcut
  CreateDirectory "$SMPROGRAMS\AIM TRAINER PRO"
  CreateShortcut "$SMPROGRAMS\AIM TRAINER PRO\AIM TRAINER PRO.lnk" "$INSTDIR\AIM TRAINER PRO.exe" "" "$INSTDIR\resources\assets\icon.ico" 0
  CreateShortcut "$SMPROGRAMS\AIM TRAINER PRO\Uninstall.lnk" "$INSTDIR\Uninstall AIM TRAINER PRO.exe"
  
  ; Register for auto-updater
  WriteRegStr HKCU "Software\AIM TRAINER PRO" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\AIM TRAINER PRO" "Version" "${VERSION}"
  
  ; Set file associations (optional)
  WriteRegStr HKCR ".aimconfig" "" "AIMTrainerConfig"
  WriteRegStr HKCR "AIMTrainerConfig" "" "AIM TRAINER PRO Config File"
  WriteRegStr HKCR "AIMTrainerConfig\shell\open\command" "" '"$INSTDIR\AIM TRAINER PRO.exe" "%1"'
FunctionEnd

; Uninstaller actions
Function un.onInit
  MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "AIM TRAINER PRO'yu ve tüm bileşenlerini kaldırmak istediğinizden emin misiniz?" IDYES +2
  Abort
FunctionEnd

Function un.onUninstSuccess
  ; Remove desktop shortcut
  Delete "$DESKTOP\AIM TRAINER PRO.lnk"
  
  ; Remove start menu shortcuts
  RMDir /r "$SMPROGRAMS\AIM TRAINER PRO"
  
  ; Remove registry entries
  DeleteRegKey HKCU "Software\AIM TRAINER PRO"
  DeleteRegKey HKCR ".aimconfig"
  DeleteRegKey HKCR "AIMTrainerConfig"
  
  MessageBox MB_ICONINFORMATION "AIM TRAINER PRO başarıyla kaldırıldı."
FunctionEnd 