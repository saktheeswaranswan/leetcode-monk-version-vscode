// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { getLeetCodeEndpoint } from "../commands/plugin";
import { leetCodeChannel } from "../leetCodeChannel";
import { getWorkspaceConfiguration } from "./workspaceUtils";

export namespace DialogOptions {
    export const open: vscode.MessageItem = { title: "Open" };
    export const yes: vscode.MessageItem = { title: "Yes" };
    export const no: vscode.MessageItem = { title: "No", isCloseAffordance: true };
    export const never: vscode.MessageItem = { title: "Never" };
    export const singUp: vscode.MessageItem = { title: "Sign up" };
}

export async function promptForOpenOutputChannel(message: string, type: DialogType): Promise<void> {
    let result: vscode.MessageItem | undefined;
    switch (type) {
        case DialogType.info:
            result = await vscode.window.showInformationMessage(message, DialogOptions.open, DialogOptions.no);
            break;
        case DialogType.warning:
            result = await vscode.window.showWarningMessage(message, DialogOptions.open, DialogOptions.no);
            break;
        case DialogType.error:
            result = await vscode.window.showErrorMessage(message, DialogOptions.open, DialogOptions.no);
            break;
        default:
            break;
    }

    if (result === DialogOptions.open) {
        leetCodeChannel.show();
    }
}

export async function promptForSignIn(): Promise<void> {
    const choice: vscode.MessageItem | undefined = await vscode.window.showInformationMessage(
        "Please sign in to LeetCode.",
        DialogOptions.yes,
        DialogOptions.no,
        DialogOptions.singUp,
    );
    switch (choice) {
        case DialogOptions.yes:
            await vscode.commands.executeCommand("leetcode.signin");
            break;
        case DialogOptions.singUp:
            if (getLeetCodeEndpoint()) {
                openUrl("https://leetcode-cn.com");
            } else {
                openUrl("https://leetcode.com");
            }
            break;
        default:
            break;
    }
}

export async function promptHintMessage(config: string, message: string, choiceConfirm: string, onConfirm: () => Thenable<any>): Promise<void> {
    if (getWorkspaceConfiguration().get<boolean>(`hint.${config}`)) {
        const choiceNoShowAgain: string = "Don't show again";
        const choice: string | undefined = await vscode.window.showInformationMessage(
            message, choiceConfirm, choiceNoShowAgain,
        );
        if (choice === choiceConfirm) {
            await onConfirm();
        } else if (choice === choiceNoShowAgain) {
            await getWorkspaceConfiguration().update(`hint.${config}`, false, true /* UserSetting */);
        }
    }
}

export async function showFileSelectDialog(): Promise<vscode.Uri[] | undefined> {
    const defaultUri: vscode.Uri | undefined = vscode.workspace.rootPath ? vscode.Uri.file(vscode.workspace.rootPath) : undefined;
    const options: vscode.OpenDialogOptions = {
        defaultUri,
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select",
    };
    return await vscode.window.showOpenDialog(options);
}

export async function openUrl(url: string): Promise<void> {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
}

export enum DialogType {
    info = "info",
    warning = "warning",
    error = "error",
}
