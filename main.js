// Import VSCode API.
const vscode = require("vscode");

// Import FS and Path API.
const fs = require("fs");
const path = require("path");

// Create a Output Channel for extension logs.
const log = vscode.window.createOutputChannel("Kurou");
function sendLog(data, lastLine) {
	log.appendLine(data);
	if(lastLine) log.appendLine("");
}

// Throw notification to reload VSCode.
function promptReload(message) {
	vscode.window.showInformationMessage(message+" Reload to see the changes.", "Reload").then((value) => {
		if(value === "Reload") {
			vscode.commands.executeCommand("workbench.action.reloadWindow");
		}
	});
}

// Execute this function when the extension start.
function activate(context) {
	sendLog("─ Kurou extension running.", true);

	// Create the workbench.background.desktop.main.css file if doesn't exist.
	if(!fs.existsSync(path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css"))) {
		try {
			fs.openSync(path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css"), "w");

			sendLog("─ A file got created : " + path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css"), true);
		} catch(err) {
			sendLog("┌ An error has occurred ! [Code: E1]", false);
			sendLog("├─── Go to the extension's GitHub for more information.", false);
			sendLog("└─── Link : https://github.com/HolomeFR/Kurou#readme", true);
		}
	}

	// Edit the workbench.background.desktop.main.css file if a background image link is found in the extension settings.
	const extensionSettings = require("./src/settings.json");
	const styleFileData = fs.readFileSync(path.join(__dirname, "\\src\\datas\\style.css"), { encoding: "utf-8", flag: "r" });
	if(extensionSettings.backgroundLink || extensionSettings.backgroundLink != "") {
		const firstPartOfData = styleFileData.slice(0, 153);
		const secondPartOfData = styleFileData.slice(-541);
		const data = firstPartOfData + extensionSettings.backgroundLink + secondPartOfData;
		try {
			fs.writeFileSync(path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css"), data, { encoding: "utf-8", flag: "w" });

			sendLog("─ A file got edited : " + path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css"), true);
		} catch(err) {
			sendLog("┌ An error has occurred ! [Code: E2]", false);
			sendLog("├─── Go to the extension's GitHub for more information.", false);
			sendLog("└─── Link : https://github.com/HolomeFR/Kurou#readme", true);
		}
	}

	// Edit the workbench.html file to include the new tags.
	// WARNING : This part of the extension is the most sensitive because it modifies the main HTML file of VSCode.
	try {
		const htmlWorkbenchData = fs.readFileSync(path.join(vscode.env.appRoot, "\\out\\vs\\code\\electron-sandbox\\workbench\\workbench.html"), { encoding: "utf-8", flag: "r" });
		const tagsFileData = fs.readFileSync(path.join(__dirname, "\\src\\datas\\tags.html"), { encoding: "utf-8", flag: "r" });
		const data = htmlWorkbenchData.slice(0, 124) + "\r\n\r\n" + tagsFileData.replace("[PATH_HERE]", path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css").replaceAll("\\", "/")) + "\r\n" + htmlWorkbenchData.slice(-144);
		if(data != htmlWorkbenchData) {
			fs.writeFile(path.join(vscode.env.appRoot, "\\out\\vs\\code\\electron-sandbox\\workbench\\workbench.html"), data, { encoding: "utf-8", flag: "w" }, () => {
				sendLog("─ A file got edited : " + path.join(vscode.env.appRoot, "\\out\\vs\\code\\electron-sandbox\\workbench\\workbench.html"), true);
				vscode.commands.executeCommand("workbench.action.reloadWindow");
			});
		}
	} catch(err) {
		sendLog("┌ An error has occurred ! [Code: E3]", false);
		sendLog("├─── Go to the extension's GitHub for more information.", false);
		sendLog("└─── Link : https://github.com/HolomeFR/Kurou#readme", true);
	}

	// When the the command executed, change the extension settings file to add the new background image link.
	const changeBackgroundImage = vscode.commands.registerCommand("kurou.change-background-image", async () => {
		const newBackgroundLink = await vscode.window.showInputBox({
			placeHolder: "",
			prompt: "Only http and https links are allowed, same for the extension where only jpg, jpeg and png are allowed.",
			value: extensionSettings.backgroundLink
		});
		if(!newBackgroundLink || newBackgroundLink == "") return;
		else if((newBackgroundLink.startsWith("https://") || newBackgroundLink.startsWith("http://")) && (newBackgroundLink.endsWith(".jpg") || newBackgroundLink.endsWith(".jpeg") || newBackgroundLink.endsWith(".png"))) {
			const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, "\\src\\settings.json"), { encoding: "utf-8", flag: "r" }));
			settingsData.backgroundLink = newBackgroundLink;
			fs.writeFileSync(path.join(__dirname, "\\src\\settings.json"), JSON.stringify(settingsData, null, 4), { encoding: "utf-8", flag: "w" });

			const firstPartOfData = styleFileData.slice(0, 153);
			const secondPartOfData = styleFileData.slice(-541);
			const data = firstPartOfData + extensionSettings.backgroundLink + secondPartOfData;
			try {
				fs.writeFileSync(path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css"), data, { encoding: "utf-8", flag: "w" });

				promptReload("Your wallpaper has been changed!");
				sendLog("─ A file got edited : " + path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css"), true);
			} catch(err) {
				sendLog("┌ An error has occurred ! [Code: E2]", false);
				sendLog("├─── Go to the extension's GitHub for more information.", false);
				sendLog("└─── Link : https://github.com/HolomeFR/Kurou#readme", true);
			}
		} else {
			sendLog("┌ An error has occurred ! [Code: E4]", false);
			sendLog("├─── Go to the extension's GitHub for more information.", false);
			sendLog("└─── Link : https://github.com/HolomeFR/Kurou#readme", true);

			vscode.window.showWarningMessage("Your link is not supported, please try an another !");
		}
	});
	context.subscriptions.push(changeBackgroundImage);

	// When the the command is executed, change the extension settings file to remove the background image link.
	const removeBackgroundImage = vscode.commands.registerCommand("kurou.remove-background-image", () => {
		const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, "\\src\\settings.json"), { encoding: "utf-8", flag: "r" }));
		settingsData.backgroundLink = "";
		fs.writeFileSync(path.join(__dirname, "\\src\\settings.json"), JSON.stringify(settingsData, null, 4), { encoding: "utf-8", flag: "w" });

		const firstPartOfData = styleFileData.slice(0, 153);
		const secondPartOfData = styleFileData.slice(-541);
		const data = firstPartOfData + extensionSettings.backgroundLink + secondPartOfData;
		try {
			fs.writeFileSync(path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css"), data, { encoding: "utf-8", flag: "w" });

			promptReload("Your wallpaper has been removed!");
			sendLog("─ A file got edited : " + path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css"), true);
		} catch(err) {
			sendLog("┌ An error has occurred ! [Code: E2]", false);
			sendLog("├─── Go to the extension's GitHub for more information.", false);
			sendLog("└─── Link : https://github.com/HolomeFR/Kurou#readme", true);
		}
	});
	context.subscriptions.push(removeBackgroundImage);
}

// Execute this function when the extension stop.
function deactivate() {
	// Delete the workbench.background.desktop.main.css file.
	if(fs.existsSync(path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css"))) {
		fs.unlink(path.join(vscode.env.appRoot, "\\out\\vs\\workbench\\workbench.background.desktop.main.css"), (err) => {
			if(err) {
				sendLog("┌ An error has occurred ! [Code: E5]", false);
				sendLog("├─── Go to the extension's GitHub for more information.", false);
				sendLog("└─── Link : https://github.com/HolomeFR/Kurou#readme", true);
			}

			vscode.commands.executeCommand("workbench.action.reloadWindow");
		});
	}
}

// Export "activate" and "deactivate" functions.
module.exports = { activate, deactivate }