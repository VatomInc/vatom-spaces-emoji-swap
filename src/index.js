import { BasePlugin, BaseComponent } from 'vatom-spaces-plugins'

/**
 * This is the main entry point for your plugin.
 *
 * All information regarding plugin development can be found at
 * https://developer.vatom.com/spaces/plugins-in-spaces/guide-create-plugin
 *
 * @license MIT
 * @author Vatom Inc.
 */
export default class PhotoBoothPlugin extends BasePlugin {

    /** Plugin info */
    static id = "com.vatom.emojiswap"
    static name = "Emoji Swap Game"

    /** Called on load */
    onLoad() {

        // Register menu button
        this.menus.register({
            section: 'controls',
            icon: this.paths.absolute('icon-button2.svg'),
            text: 'Emoji Swap',
            panel: {
                inAccordion: true,
                title: 'Emoji Swap',
                iframeURL: this.paths.absolute('ui-build/index.html') + '#/my-emojis'
            }
        })

    }

}