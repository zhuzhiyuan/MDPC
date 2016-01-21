#!/usr/bin/python
# coding=gbk 
import os
import commands

APP_PATH = "build/明道/osx64/明道.app"
DEVELOPER_ID = "Developer ID Application: Shanghai Wanqi Mingdao Software Co., Ltd."

def signWithPath(path):
    signCommand = "codesign --force --sign \"%s\" \"%s\"" % (DEVELOPER_ID, path)
    retCode, result = commands.getstatusoutput(signCommand)
    if retCode != 0:
        print result
        print "code sign failed"
    return retCode

def validateWithPath(path):
    signCommand = "codesign --verify --deep --verbose=3 \"%s\"" % path
    retCode, result = commands.getstatusoutput(signCommand)
    if retCode == 0:
        print "Accepted!"
        return 0
    else:
        print result
        print "Rejected!"
        return -2

def sign():
    print "> signing frameworks & dylibs..."

    if not os.path.exists(APP_PATH):
        print "where's your app?!"
        return

    frameworkDir = os.path.join(APP_PATH, "Contents/")

    # sign dylibs
    for root, dirs, files in os.walk(frameworkDir):
        for f in files:
            if f.endswith(".dylib"):
                print "signing", f
                dylibPath = os.path.join(root, f)
                signWithPath(dylibPath)

    # sign frameworks
    for root, dirs, files in os.walk(frameworkDir):
        for d in dirs:
            if d.endswith(".framework"):
                print "signing", d
                frameworkPath = os.path.join(root, d, "Versions/A")
                signWithPath(frameworkPath)


    print "> singing app..."
    print "singing", APP_PATH
    signWithPath(APP_PATH)

    print "> validate code sign..."
    if validateWithPath(APP_PATH) == 0:
        print "Code sign completed!"
    else:
        print "Dohhh!"


if __name__ == '__main__':
    sign()
