#!/usr/bin/env node
"use strict";

var defaultCoreVersion = "31";
var supportedCoreVersions = ["31", "30", "22", "21"];

// Initialize
process.title = 'dnt';
console.log("DNT (DotNetTools) NPM CLI");
var args = process.argv.splice(2, process.argv.length - 2).map(function (a) { return a.indexOf(" ") === -1 ? a : '"' + a + '"' }).join(" ");

// Search for full .NET installation
var hasFullDotNet = false;
var fs = require('fs');
if (process.env["windir"]) {
    try {
        var stats = fs.lstatSync(process.env["windir"] + '/Microsoft.NET');
        if (stats.isDirectory())
            hasFullDotNet = true;
    }
    catch (e) {
        console.log(e);
    }
}

var c = require('child_process');
if (hasFullDotNet && args.toLowerCase().indexOf("/runtime:netcore") == -1) {
    // Run full .NET version
    var cmd = '"' + __dirname + '/binaries/Win/dnt.exe" ' + args;
    var code = c.execSync(cmd, { stdio: [0, 1, 2] });
} else {
    // Run .NET Core version
    var defaultCmd = 'dotnet "' + __dirname + '/binaries/NetCore' + defaultCoreVersion + '/dnt.dll" ' + args;
    var infoCmd = "dotnet --version";
    c.exec(infoCmd, (error, stdout, stderr) => {
        for (let version of supportedCoreVersions) {
            var coreCmd = 'dotnet "' + __dirname + '/binaries/NetCore' + version + '/dnt.dll" ' + args;

            if (args.toLowerCase().indexOf("/runtime:netcore" + version) != -1) {
                c.execSync(coreCmd, { stdio: [0, 1, 2] });
                return;
            } else {
                if (!error) {
                    var coreVersion = stdout;
                    if (coreVersion.indexOf(version + ".0") !== -1) {
                        c.execSync(coreCmd, { stdio: [0, 1, 2] });
                        return;
                    }
                }
            }
        }
        c.execSync(defaultCmd, { stdio: [0, 1, 2] });
        return;
    });
}