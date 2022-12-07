const vscode = require('vscode');

function activate(context) {
	const fs = require('fs');
	const paths = {
		vscode: {
			root: `${require('path').parse(require('process').execPath).dir}`,
			wrb: "resources\\app\\out\\vs\\workbench",
			wdm: "workbench.desktop.main.css"
		},
		extension: {
			root: `${__dirname}`,
			cbi: "themes\\custom-background-image.css"
		}
	}

	/* ---------------------------- */
	/* Display the background image */
	/* ---------------------------- */
	const displayBackgroundImage = vscode.commands.registerCommand('chiya-theme.displayBackgroundImage', () => {
		// Checks if there is a custom background image
		const data = fs.readFileSync(`${paths.extension.root}\\${paths.extension.cbi}`, { encoding: "utf-8", flag: "r" });
		if (fs.readFileSync(`${paths.vscode.root}\\${paths.vscode.wrb}\\${paths.vscode.wdm}`, { encoding: "utf-8", flag: "r" }).endsWith(data)) {
			// Send Message
			vscode.window.showWarningMessage("Custom background image already exists !");
		} else {
			// Edit VSCode CSS & Create a detector file
			fs.writeFileSync(`${paths.vscode.root}\\${paths.vscode.wrb}\\${paths.vscode.wdm}`, data, { encoding: "utf-8", flag: "a" });

			// Reload VSCode
			vscode.commands.executeCommand("workbench.action.reloadWindow");

			// Send Message
			vscode.window.showInformationMessage("Custom background image created.");
		}
	});
	context.subscriptions.push(displayBackgroundImage);



	/* -------------------------- */	
	/*  Hide the background image */
	/* -------------------------- */
	const hideBackgroundImage = vscode.commands.registerCommand('chiya-theme.hideBackgroundImage', () => {
		// Checks if there is a custom background image
		const dataLength = fs.readFileSync(`${paths.extension.root}\\${paths.extension.cbi}`, { encoding: "utf-8", flag: "r" }).length;
		const data = fs.readFileSync(`${paths.vscode.root}\\${paths.vscode.wrb}\\${paths.vscode.wdm}`, { encoding: "utf-8", flag: "r" });
		if (fs.readFileSync(`${paths.vscode.root}\\${paths.vscode.wrb}\\${paths.vscode.wdm}`, { encoding: "utf-8", flag: "r" }).endsWith(data)) {
			// Edit VSCode CSS & Remove the detector file
			fs.writeFileSync(`${paths.vscode.root}\\${paths.vscode.wrb}\\${paths.vscode.wdm}`, data.slice(0, -dataLength), { encoding: "utf-8"});

			// Reload VSCode
			vscode.commands.executeCommand("workbench.action.reloadWindow");

			// Send Message
			vscode.window.showInformationMessage("Custom background image removed.");
		} else {
			// Send Message
			vscode.window.showWarningMessage("Custom background image does not exist yet !");
		}
	});
	context.subscriptions.push(hideBackgroundImage);
}

module.exports = {
	activate
}
