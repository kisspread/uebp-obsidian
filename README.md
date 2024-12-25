 # Obsidian BlueprintUE Plugin

An Obsidian plugin that renders Unreal Engine Blueprint nodes in your notes. Based on the excellent [blueprintue-self-hosted-edition](https://github.com/blueprintue/blueprintue-self-hosted-edition) project.

## Features

- Render Unreal Engine Blueprint nodes in your Obsidian notes
- Interactive node visualization with pan and zoom
- Node connection visualization
- Copy button for blueprint text
- Light and dark theme support

## Installation

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Unreal Engine Blueprint Renderer"
4. Click Install
5. Enable the plugin

## Usage

Wrap your blueprint code in a code block with the `uebp` language identifier. You can optionally specify a custom height:

````markdown
```uebp height="500px"
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_0"
   FunctionReference=(MemberName="PrintString",bSelfContext=True)
   NodePosX=0
   NodePosY=0
   NodeGuid=A0000000000000000000000000000000
End Object
```
````

The height parameter is optional and can be specified in:
- Pixels: `height="500px"`
- Em units: `height="30em"`
- Viewport height: `height="50vh"`

If not specified, the default height will be used.

## Settings

You can configure the following settings:

- **Default Height**: Set the default height for blueprint renderers
- **Theme**: Choose between light and dark theme

## License

This plugin is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.