; 脚本由 Inno Setup 脚本向导 生成！
; 有关创建 Inno Setup 脚本文件的详细资料请查阅帮助文档！

#define WorkPath="D:\Solution\MDPC\"
#define BuildPath="D:\Solution\MDPC\build\明道\win\"
#define MyAppName "明道"
#define MyAppCacheName "明道"
#define MyAppVersion "1.0"
#define MyAppPublisher "上海万企明道软件有限公司"
#define MyAppURL "http://www.mingdao.com/"
#define MyAppExeName "明道.exe"
#define OriginalName "明道_original.exe"

[Setup]
; 注: AppId的值为单独标识该应用程序。
; 不要为其他安装程序使用相同的AppId值。
; (生成新的GUID，点击 工具|在IDE中生成GUID。)
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
//安装前判断是否有进程正在运行
//function IsModuleLoaded(modulename: String ): Boolean;
//external 'IsModuleLoaded@files:psvince.dll stdcall setuponly';

// 安装前检查关闭**进程
function InitializeSetup():Boolean;
var ErrorCode: Integer;  
    IsRunning: HWND; 
begin
  //Log('Checking If Running...');
   Result := true;
   IsRunning:=FindWindowByWindowName('{#MyAppName}');  
   if IsRunning<>0 then   
      begin  
        if Msgbox('安装程序检测到客户端正在运行。' #13#13 '您必须先关闭它!!!单击“是”继续安装，或按“否”退出！', mbConfirmation, MB_YESNO) = idNO then  
        begin  
          Result :=false; //安装程序退出  
          IsRunning :=0;  
        end 
        else 
        begin
          ShellExec('open','taskkill.exe','/f /im {#MyAppExeName}','',SW_HIDE,ewNoWait,ErrorCode);
          ShellExec('open','tskill.exe',' {#MyAppName}','',SW_HIDE,ewNoWait,ErrorCode);    
          Result :=true; //安装程序继续
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
; 注意: 不要在任何共享系统文件上使用“Flags: ignoreversion”

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
