const vscode = require('vscode');
const fs = require('fs');
/** @param { vscode.ExtensionContext } context */

function activate(context) {
	console.log("Chiya theme is active !");

	let refreshCommand = vscode.commands.registerCommand('chiya-theme.refreshTheme', () => {
		vscode.window.showInformationMessage("The Chiya Theme got refreshed !");
	});

	context.subscriptions.push(refreshCommand);
}

function deactivate() {
	console.log("Chiya theme is deactivate !");
}

module.exports = {
	activate,
	deactivate
}