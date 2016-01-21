#!/bin/bash
echo
echo "True Interactions (Tint) and nwjs Mac App Store / Entitlements Signing Tool."
echo "NOTE: THIS SIGNING TOOL IS INTENDED ONLY FOR APPLICATIONS TO BE SUBMITTED TO"
echo "THE MAC APP STORE OR THAT NEED ENTITLEMENTS. IF YOU DO NOT PLAN ON USING EITHER"
echo "USE THE DEFAULT SIGNING UTILITY."
echo "www.trueinteractions.com"
echo
if [ -z "$5" ]
then
    echo "Usage: sign.sh application_file_path application_name bundle_id identity out_directory"
    echo "  application_file_name \t The full path to the application to sign, original is not modified"
    echo "  application_name \t\t The full application name (with spaces if needed), do not include .app extention"
    echo "  bundle_id \t\t\t The bundle identifier used in the Info.plist, it must be unique for helpers and the app"
    echo "  identity \t\t\t The identity to sign the application with (a valid list of id's is printed out later)"
    echo "  out_directory \t\t The directory to place the signed application at"
    echo ""
    echo "If you do not know your identity pick the most appropriate one from the list below, the valid identities"
    echo "installed on your /Applications/Utilities/Keychain Access.app are:"
    echo
    security -q find-identity -p codesigning -v
    echo
    echo "Tip: your identity is the alpha-numeric, usually 10 character long string contained between parenthesis."
    echo "Note that entitlements for the Mac App Store will be applied, this will sandbox the application and may"
    echo "in certain circumstances cause new errors if your application plays outside of Mac App Stores rules."
    echo
    exit 1;
fi

export SOURCE=$1
export NAME=$2
export IDENTITY=$4
export BUNDLEID=$3
export OUTDIRECTORY=$5
export ENTITLEMENTS_PARENT='<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.print</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.temporary-exception.files.absolute-path.read-write</key>
    <string>/</string>
</dict>
</plist>
'
export ENTITLEMENTS_CHILD='<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.inherit</key>
    <true/>
</dict>
</plist>
'
export PATH_PARENT='/tmp/parententitlements.plist'
export PATH_CHILD='/tmp/childentitlements.plist'
echo "$ENTITLEMENTS_PARENT" > $PATH_PARENT
echo "$ENTITLEMENTS_CHILD" > $PATH_CHILD

# copy your app to this folder.
rm -rf $OUTDIRECTORY/$NAME.app
cp -p -a $SOURCE $OUTDIRECTORY/$NAME.app

echo "==update BUNDLEID=="

/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $BUNDLEID" "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper.app/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $BUNDLEID" "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper EH.app/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $BUNDLEID" "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper NP.app/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $BUNDLEID" "$OUTDIRECTORY/$NAME.app/Contents/Info.plist" 


echo "==Signing Code=="
codesign --entitlements $PATH_CHILD -s "$IDENTITY" -i "$BUNDLEID" --keychain /Users/mingdao/Library/Keychains/login.keychain --deep "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Framework.framework/Libraries/ffmpegsumo.so"
codesign --entitlements $PATH_CHILD -s "$IDENTITY" -i "$BUNDLEID" --keychain /Users/mingdao/Library/Keychains/login.keychain --deep "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper.app"
codesign --entitlements $PATH_CHILD -s "$IDENTITY" -i "$BUNDLEID" --keychain /Users/mingdao/Library/Keychains/login.keychain --deep "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper EH.app"
codesign --entitlements $PATH_CHILD -s "$IDENTITY" -i "$BUNDLEID" --keychain /Users/mingdao/Library/Keychains/login.keychain --deep "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper NP.app"
codesign --entitlements $PATH_PARENT -s "$IDENTITY" -i "$BUNDLEID" --keychain /Users/mingdao/Library/Keychains/login.keychain --deep "$OUTDIRECTORY/$NAME.app"

rm -rf $OUTDIRECTORY/$NAME.app/Icon^M
#rm -f $PATH_CHILD
#rm -f $PATH_PARENT

# validate entitlements
echo "==Validating entitlements and Mac App Store needs=="
codesign -dvvv --entitlements :- "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper.app/Contents/MacOS/nwjs Helper"
codesign -dvvv --entitlements :- "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper EH.app/Contents/MacOS/nwjs Helper EH"
codesign -dvvv --entitlements :- "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper NP.app/Contents/MacOS/nwjs Helper NP"
codesign -dvvv --entitlements :- "$OUTDIRECTORY/$NAME.app/Contents/MacOS/nwjs"

# validate code signatures
echo "==Validating code signature and subsequent resources=="
spctl --assess -vvvv "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper.app"
spctl --assess -vvvv "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper EH.app"
spctl --assess -vvvv "$OUTDIRECTORY/$NAME.app/Contents/Frameworks/nwjs Helper NP.app"
spctl --assess -vvvv "$OUTDIRECTORY/$NAME.app"
