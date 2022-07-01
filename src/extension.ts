// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';

const lint = async (filePath: string|undefined = undefined) => {
	// check if file exists in current proect
	const artisanFiles = await vscode.workspace.findFiles('artisan', undefined, 1);
	if (artisanFiles.length === 0) {
		return;
	}

	// Now that we have the artisan file, we can look for the vendor directory
	const projectFolder = path.dirname(artisanFiles[0].path);
	const vendorFolder = path.join(projectFolder, 'vendor');
	if (!fs.existsSync(vendorFolder)) {
		return;
	}

	// Now that we have the vendor folder, we can look for the Laravel Pint Linter
	const laravelPintPath = path.join(vendorFolder, 'bin', 'pint');
	if (!fs.existsSync(laravelPintPath)) {
		return;
	}

	filePath = filePath || vscode.window.activeTextEditor?.document.fileName;
	if (!filePath || path.extname(filePath) !== '.php') {
		return;
	}


	cp.exec(`${laravelPintPath} ${filePath}`, (err, stdout, stderr) => {
		if (err) {
			console.error(err);
		}
	});
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('laravel-pint-linter.lint', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		await lint();
	});

	let willSave = vscode.workspace.onWillSaveTextDocument(async (e) => {
		e.waitUntil(lint(e.document.fileName));
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(willSave);
}

// this method is called when your extension is deactivated
export function deactivate() {}
