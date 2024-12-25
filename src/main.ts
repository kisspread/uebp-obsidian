import { App, MarkdownPostProcessorContext, Plugin, PluginSettingTab, Setting } from 'obsidian';

// 声明资源内容，这些值会在构建时被替换
declare const RENDER_JS: string;
declare const COPY_BUTTON_JS: string;
declare const RENDER_CSS: string;
declare const COPY_BUTTON_CSS: string;

interface UEBPSettings {
	defaultHeight: string;
	darkTheme: boolean;
}

const DEFAULT_SETTINGS: UEBPSettings = {
	defaultHeight: '500px',
	darkTheme: false
}

// 声明全局变量
declare global {
	interface Window {
		blueprintUE: {
			render: {
				Main: new (text: string, element: HTMLElement, options: any) => {
					start: () => void;
				};
			};
		};
	}
}

export default class UEBPPlugin extends Plugin {
	settings: UEBPSettings;
	private hasLoadedResources: boolean = false;

	async onload() {
		await this.loadSettings();

		// 加载资源文件
		this.loadResources();

		// 注册代码块渲染器
		this.registerMarkdownCodeBlockProcessor('uebp', (source, el, ctx) => {
			this.renderBlueprint(source, el, ctx);
		});

		// 添加设置选项卡
		this.addSettingTab(new UEBPSettingTab(this.app, this));
	}

	onunload() {
		// 清理工作
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * 加载资源文件
	 */
	private loadResources() {
		try {
			// 添加样式
			const styleEl = document.createElement('style');
			styleEl.textContent = RENDER_CSS + COPY_BUTTON_CSS;
			document.head.appendChild(styleEl);

			// 添加脚本
			const scriptEl = document.createElement('script');
			scriptEl.textContent = RENDER_JS + COPY_BUTTON_JS;
			document.head.appendChild(scriptEl);

			this.hasLoadedResources = true;
		} catch (error) {
			console.error('Failed to load resources:', error);
		}
	}

	/**
	 * 渲染蓝图代码块
	 */
	private renderBlueprint(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		if (!this.hasLoadedResources) {
			console.error('Resources not loaded');
			el.createDiv({ cls: 'uebp-error', text: 'Failed to load blueprint renderer resources.' });
			return;
		}

		try {
			// 创建容器
			const container = el.createDiv({ cls: 'uebp-container bue-render' });
			
			// 设置高度
			const height = this.getHeightFromSource(source) || this.settings.defaultHeight;
			container.style.height = height;

			// 添加主题类
			container.addClass(this.settings.darkTheme ? 'theme-dark' : 'theme-light');

			// 生成唯一ID
			const containerId = `bue_container_${Math.random().toString(36).substring(7)}`;
			const blueprintId = `bue_data_${Math.random().toString(36).substring(7)}`;

			// 创建渲染容器和数据容器
			const renderContainer = container.createDiv({ cls: 'uebp-render', attr: { id: containerId } });
			const dataContainer = container.createEl('textarea', { 
				text: source,
				attr: { 
					id: `${blueprintId}_data`,
					style: 'display: none;'
				}
			});

			// 添加复制按钮
			const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/></svg>`;
			const doneIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>`;
			
			const copyButton = container.createEl('button', {
				cls: 'bue-copy-button',
				attr: {
					title: 'Copy blueprint'
				}
			});
			copyButton.innerHTML = copyIcon;
			
			copyButton.addEventListener('click', async () => {
				try {
					await navigator.clipboard.writeText(source);
					copyButton.classList.add('copied');
					copyButton.innerHTML = doneIcon;
					setTimeout(() => {
						copyButton.classList.remove('copied');
						copyButton.innerHTML = copyIcon;
					}, 2000);
				} catch (err) {
					console.error('Failed to copy text:', err);
				}
			});

			// 创建初始化脚本
			const script = container.createEl('script', {
				text: `
					(function() {
						function initBlueprintRenderer() {
							const textarea = document.getElementById('${blueprintId}_data');
							const container = document.getElementById('${containerId}');
							if (!textarea || !container) return;
							if (!window.blueprintUE || !window.blueprintUE.render || !window.blueprintUE.render.Main) {
								console.log('Blueprint renderer not ready, retrying...');
								setTimeout(initBlueprintRenderer, 100);
								return;
							}
							try {
								console.log('Initializing blueprint renderer...');
								new window.blueprintUE.render.Main(textarea.value, container, {
									type: 'blueprint',
									height: '${height}'
								}).start();
								console.log('Blueprint renderer initialized');
							} catch(e) {
								console.error('Error initializing blueprint renderer:', e);
								container.innerHTML = '<div class="uebp-error">Error rendering blueprint: ' + e.message + '</div>';
							}
						};
						if (document.readyState === 'complete') {
							initBlueprintRenderer();
						} else {
							window.addEventListener('load', initBlueprintRenderer);
						}
					})();
				`
			});

		} catch (error) {
			console.error('Blueprint render error:', error);
			el.createDiv({ cls: 'uebp-error', text: `Error rendering blueprint: ${error.message}` });
		}
	}

	/**
	 * 从源代码中提取高度设置
	 */
	private getHeightFromSource(source: string): string | null {
		const match = source.match(/^height="([^"]+)"/m);
		if (match) {
			// 移除高度设置行
			source = source.replace(/^height="[^"]+"\n/m, '');
			return match[1];
		}
		return null;
	}
}

class UEBPSettingTab extends PluginSettingTab {
	plugin: UEBPPlugin;

	constructor(app: App, plugin: UEBPPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Default Height')
			.setDesc('Set the default height for blueprint renderers')
			.addText(text => text
				.setPlaceholder('500px')
				.setValue(this.plugin.settings.defaultHeight)
				.onChange(async (value) => {
					this.plugin.settings.defaultHeight = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Dark Theme')
			.setDesc('Use dark theme for blueprint renderers')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.darkTheme)
				.onChange(async (value) => {
					this.plugin.settings.darkTheme = value;
					await this.plugin.saveSettings();
				}));
	}
}
