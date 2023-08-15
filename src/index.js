import { BasePlugin, BaseComponent } from 'vatom-spaces-plugins'
import { BridgeAction, StateBridge } from './StateBridge'

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
    async onLoad() {

        // Register menu button
        this.menus.register({
            section: 'controls',
            icon: this.paths.absolute('icon-button.svg'),
            text: 'Emoji Swap',
            panel: {
                inAccordion: true,
                title: 'Emoji Swap',
                iframeURL: this.paths.absolute('ui-build/index.html') + '#/my-emojis'
            }
        })

        // Set emoji list
        StateBridge.shared.state.emojis = [
            '😀', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😋', '😛', '😝', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👹', '👺', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
        ]

        // Set emoji score
        StateBridge.shared.state.score = 0

        // Set current user's emoji, based on their user ID
        let userID = await this.user.getID()
        var index = 0
        for (let i = 0 ; i < userID.length ; i++) index += userID.charCodeAt(i)
        index = index % StateBridge.shared.state.emojis.length
        StateBridge.shared.state.myEmoji = StateBridge.shared.state.emojis[index]

        // Set collected emojis. User has already collected their own emoji.
        StateBridge.shared.state.collectedEmojis = {
            [StateBridge.shared.state.myEmoji]: {
                userID,
                name: await this.user.getDisplayName(),
            }
        }

    }

    /** (bridged) Show an alert dialog */
    showAlert = StateBridge.shared.register('showAlert', async (msg, title, icon) => {
        await this.menus.alert(msg, title, icon)
    })

}