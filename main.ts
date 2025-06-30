import { Plugin, PluginSettingTab, Setting, Notice, moment, Modal, TFile } from "obsidian";

/** 設定の型定義とデフォルト値 */
export interface TodaySummarySettings {
  openaiKey: string;
  prompt: string;
}

export const DEFAULT_SETTINGS: TodaySummarySettings = {
  openaiKey: "",
  prompt: "以下のメモを日本語で要約してください:\n{{text}}"
};

/** メインプラグイン */
export default class TodaySummaryPlugin extends Plugin {
  settings: TodaySummarySettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new TodaySummarySettingTab(this));
    this.addRibbonIcon("calendar", "今日の要約", () => this.summarize());
    this.addCommand({ id: "summarize-today", name: "今日更新ノートを要約", callback: () => this.summarize() });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private async summarize() {
    const today = moment();
    const start = today.clone().startOf("day").valueOf();
    const end = today.clone().endOf("day").valueOf();

    const files: TFile[] = this.app.vault.getMarkdownFiles()
      .filter(f => f.stat.mtime >= start && f.stat.mtime <= end);
    if (!files.length) return new Notice("本日更新されたノートはありません");

    const fileNames = files.map(f => f.basename).join(", ");
    const txt = (await Promise.all(files.map(f => this.app.vault.cachedRead(f)))).join("\n\n---\n\n");
    const chunks = this.chunk(txt, 12_000);
    const partial = await Promise.all(chunks.map((c: string, i: number) => this.openai(c, i, chunks.length)));
    const finalSummary = await this.openai(partial.join("\n\n"), 0, 1, true);
    this.showModal(finalSummary, fileNames);
  }

  private chunk(text: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.slice(i, i + size));
    }
    return chunks;
  }

  private async openai(text: string, index: number, total: number, isFinal = false): Promise<string> {
    if (!this.settings.openaiKey) {
      new Notice("OpenAI API keyが設定されていません");
      return "";
    }

    const prompt = isFinal 
      ? "以下の部分要約を統合して、全体の要約を作成してください:\n" + text
      : this.settings.prompt.replace("{{text}}", text);

    try {
      const response = await this.fetchWithRetry("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.settings.openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      new Notice(`要約エラー (${index + 1}/${total}): ${error}`);
      return "";
    }
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error("Max retries exceeded");
  }

  private showModal(content: string, fileNames: string) {
    new SummaryModal(this.app, content, fileNames).open();
  }
}

/** 設定タブ */
class TodaySummarySettingTab extends PluginSettingTab {
  plugin: TodaySummaryPlugin;

  constructor(plugin: TodaySummaryPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("OpenAI API Key")
      .setDesc("platform.openai.com で発行したシークレットキー")
      .addText(text =>
        text
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.openaiKey)
          .onChange(async (v) => {
            this.plugin.settings.openaiKey = v;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("要約プロンプト")
      .setDesc("{{text}} がノート本文に展開されます")
      .addTextArea(text =>
        text
          .setValue(this.plugin.settings.prompt)
          .onChange(async (v) => {
            this.plugin.settings.prompt = v;
            await this.plugin.saveSettings();
          }),
      );
  }
}

/** 要約結果表示モーダル */
class SummaryModal extends Modal {
  content: string;
  fileNames: string;

  constructor(app: any, content: string, fileNames: string) {
    super(app);
    this.content = content;
    this.fileNames = fileNames;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "今日の要約" });
    contentEl.createEl("h3", { text: "更新されたファイル:" });
    contentEl.createEl("p", { text: this.fileNames });
    contentEl.createEl("h3", { text: "要約:" });
    contentEl.createEl("div", { text: this.content });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}