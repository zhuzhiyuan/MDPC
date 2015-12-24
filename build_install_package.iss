; �ű��� Inno Setup �ű��� ���ɣ�
; �йش��� Inno Setup �ű��ļ�����ϸ��������İ����ĵ���

#define WorkPath="D:\Solution\MDPC\"
#define BuildPath="D:\Solution\MDPC\build\����\win\"
#define MyAppName "����"
#define MyAppCacheName "����"
#define MyAppVersion "1.0"
#define MyAppPublisher "�Ϻ���������������޹�˾"
#define MyAppURL "http://www.mingdao.com/"
#define MyAppExeName "����.exe"
#define OriginalName "����_original.exe"

[Setup]
; ע: AppId��ֵΪ������ʶ��Ӧ�ó���
; ��ҪΪ������װ����ʹ����ͬ��AppIdֵ��
; (�����µ�GUID����� ����|��IDE������GUID��)
AppId={{BD01F91B-7517-4E3D-A165-0DF4516950BD}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf}\{#MyAppName}
DefaultGroupName={#MyAppName}
LicenseFile={#WorkPath}licenses.txt
OutputDir={#WorkPath}package\
OutputBaseFilename=install
SetupIconFile={#WorkPath}chat.ico
Compression=lzma
SolidCompression=yes


[Code]
//��װǰ�ж��Ƿ��н�����������
//function IsModuleLoaded(modulename: String ): Boolean;
//external 'IsModuleLoaded@files:psvince.dll stdcall setuponly';

// ��װǰ���ر�**����
function InitializeSetup():Boolean;
var ErrorCode: Integer;  
    IsRunning: HWND; 
begin
  //Log('Checking If Running...');
   Result := true;
   IsRunning:=FindWindowByWindowName('{#MyAppName}');  
   if IsRunning<>0 then   
      begin  
        if Msgbox('��װ�����⵽�ͻ����������С�' #13#13 '�������ȹر���!!!�������ǡ�������װ���򰴡����˳���', mbConfirmation, MB_YESNO) = idNO then  
        begin  
          Result :=false; //��װ�����˳�  
          IsRunning :=0;  
        end 
        else 
        begin
          ShellExec('open','taskkill.exe','/f /im {#MyAppExeName}','',SW_HIDE,ewNoWait,ErrorCode);
          ShellExec('open','tskill.exe',' {#MyAppName}','',SW_HIDE,ewNoWait,ErrorCode);    
          Result :=true; //��װ�������
          IsRunning:=FindWindowByWindowName('{#MyAppName}');    
        end;  
   end;  
end;

function InitializeUninstall(): Boolean;
var ErrorCode: Integer;
begin
  //Log('Checking If Running...');
   ShellExec('open','taskkill.exe','/f /im {#MyAppExeName}','',SW_HIDE,ewNoWait,ErrorCode);
   ShellExec('open','tskill.exe',' {#MyAppName}','',SW_HIDE,ewNoWait,ErrorCode);
   Result := true;
end;    

[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "quicklaunchicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce

[Files]
Source: "{#BuildPath}{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#BuildPath}*.dll"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#BuildPath}*.dat"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#BuildPath}*.pak"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; ע��: ��Ҫ���κι���ϵͳ�ļ���ʹ�á�Flags: ignoreversion��

[Dirs]
Name:"{localappdata}\{#MyAppCacheName}\Images"
Name:"{localappdata}\{#MyAppCacheName}\Downloads"

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}" 
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{group}\{cm:ProgramOnTheWeb,{#MyAppName}}"; Filename: "{#MyAppURL}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[InstallDelete]
Type: filesandordirs; Name: "{localappdata}\{#MyAppCacheName}\Local Storage"
 
[UninstallDelete]
Type: filesandordirs; Name: "{localappdata}\{#MyAppCacheName}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}";Flags: nowait postinstall skipifsilent
