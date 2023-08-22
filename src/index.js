import { BasePlugin, BaseComponent } from 'vatom-spaces-plugins'
import { BridgeAction, StateBridge } from './StateBridge'

/** Standard emoji list */
const StandardEmojiList = [
    '😀', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😋', '😛', '😝', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👹', '👺', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
]

/** Reminder: Vatom wants to use these emojis only:  */

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

        // Register settings
        this.menus.register({
            section: 'plugin-settings',
            panel: {
                fields: [

                    // General
                    { id: 'info1', type: 'label', value: `The Emoji Swap game lets you swap and collect emojis with other users in the space.` },
                    { id: 'section-general', type: 'section', name: 'General' },
                    { id: 'emoji_list', name: 'Emojis', type: 'textarea', help: `The list of emojis to use in the game. You can specify an emoji multiple times to increase the chances of a user getting assigned to it.` },

                    // Vatom connections
                    { id: 'section-vatom', type: 'section', name: 'Vatom' },
                    { id: 'campaign_id', name: 'Campaign ID', type: 'text', default: '', help: `The Vatom Studio Campaign ID to use for recording points. Please visit Studio to create a Campaign.` },
                    { id: 'points_channel', name: 'Channel ID', type: 'text', default: 'emojiswap', help: `The Channel ID to use on Vatom Studio for recording point scores.` },

                ]
            }
        })

        // Register Swap Emoji button
        this.menus.register({
            section: 'usermenu',
            icon: this.paths.absolute('icon-button.svg'),
            title: 'Swap Emoji',
            action: (e) => this.onSwapEmoji(e)
        })

        // Set default initial state
        StateBridge.shared.state = {
            emojis: [],
            myEmoji: '',
            collectedEmojis: [],
            score: 0,
        }
        
        // Update state
        this.fetchEmojis()
        this.fetchScore()

    }

    /** Called when settings change */
    onSettingsUpdated() {

        // Update state
        this.fetchEmojis()
        this.fetchScore()

    }

    /** Fetch emoji list */
    async fetchEmojis() {

        // If the admin has customized the emoji list, use that instead, otherwise use the standard list
        let customEmojis = (this.getField('emoji_list') || '').split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/).map(e => e.trim()).filter(e => !!e)
        StateBridge.shared.state.emojis = customEmojis.length > 0 ? customEmojis : StandardEmojiList

        // Set current user's emoji, based on their user ID
        let userID = await this.user.getID()
        var index = 0
        for (let i = 0 ; i < userID.length ; i++) index += userID.charCodeAt(i)
        index = index % StateBridge.shared.state.emojis.length
        StateBridge.shared.state.myEmoji = StateBridge.shared.state.emojis[index]

        // Get collected emojis
        let collectedEmojis = await this.user.getProperty(null, 'collected_emojis')
        if (collectedEmojis && Array.isArray(collectedEmojis))
            StateBridge.shared.state.collectedEmojis = collectedEmojis

        // Notify state updated
        StateBridge.shared.updateState()

    }

    /** Fetch user's score */
    async fetchScore() {

        // Get score
        try {

            // Get fields
            let campaignID = this.getField('campaign_id')
            let channel = this.getField('points_channel') || 'emojiswap'
            if (!campaignID) 
                throw new Error("No Campaign ID set in the plugin settings.")

            // Fetch score
            let score = await this.hooks.trigger('vatoms.campaigns.points.get', { campaignID, channel })
            if (!score) 
                throw new Error("Failed to get score, is the Vatom plugin installed?")

            // Save it
            if (typeof score?.total != 'number') throw new Error('Returned points was not a number.')
            StateBridge.shared.state.score = score.total

        } catch (err) {
            console.warn(`[Emoji Swap] Failed to get score: ${err.message}`)
        }

        // Notify state updated
        StateBridge.shared.updateState()

    }

    /** (bridged) Show an alert dialog */
    showAlert = StateBridge.shared.register('showAlert', async (msg, title, icon) => {
        await this.menus.alert(msg, title, icon)
    })

    /** Called when the user presses Swap Emoji in the people menu */
    async onSwapEmoji(e) {

        // Show toast
        if (this.lastToastID) this.menus.closeToast(this.lastToastID)
        this.lastToastID = await this.menus.toast({ text: 'Swap request sent...' })

        // Send an alert to the other side
        let fromID = await this.user.getID()
        let fromName = await this.user.getDisplayName()
        await this.messages.send({ action: 'emojiswap:request-swap', fromID, fromName, emoji: StateBridge.shared.state.myEmoji }, false, e.user.id)

    }

    /** Called when a message is received */
    async onMessage(msg, fromID) {

        // Check action
        if (msg.action == 'emojiswap:request-swap') {

            // Swap request received
            await this.onIncomingSwapRequest(msg, fromID)

        } else if (msg.action == 'emojiswap:reject-swap') {

            // Swap request rejected, notify the user
            if (this.lastToastID) this.menus.closeToast(this.lastToastID)
            this.lastToastID = await this.menus.toast({ text: msg.owned ? `<b>${msg.fromName}</b> has already received an emoji from you.` : `<b>${msg.fromName}</b> rejected your emoji swap.` })

        } else if (msg.action == 'emojiswap:accept-swap') {

            // Notify we collected their emoji
            this.onEmojiCollected(msg.emoji, fromID, msg.fromName)

        }

    }

    /** Called when a remote user wants to swap emojis with us */
    async onIncomingSwapRequest(msg, fromID) {

        // Check if we already have an emoji from this user
        if (StateBridge.shared.state.collectedEmojis.find(e => e.fromID == fromID)) {

            // Send alert back
            await this.messages.send({ 
                action: 'emojiswap:reject-swap', 
                fromID: await this.user.getID(), 
                fromName: await this.user.getDisplayName(), 
                owned: true 
            }, false, fromID)
            return

        }

        // Create pending promise
        let promiseResolve = null
        let promiseReject = null
        let promise = new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })

        // Show toast
        if (this.lastToastID) this.menus.closeToast(this.lastToastID)
        this.lastToastID = await this.menus.toast({
            text: `Would you like to swap emojis with <b>${msg.fromName}</b> and earn points?`,
            buttonText: 'Accept',
            buttonAction: () => promiseResolve(true),
            buttonCancelText: 'Reject',
            buttonCancelAction: () => promiseResolve(false),
        })

        // Wait for toast to be completed
        let accepted = await promise

        // Close toast
        this.menus.closeToast(this.lastToastID)
        this.lastToastID = null

        // Check if accepted
        if (accepted) {

            // Swap accepted
            await this.onAcceptSwapRequest(msg, fromID)

        } else {

            // Swap rejected
            await this.onRejectSwapRequest(msg, fromID)

        }
        
    }

    /** Called when the user accepts a swap request */
    async onAcceptSwapRequest(msg, msgFromID) {

        // Send acceptance back to the other user
        let fromID = await this.user.getID()
        let fromName = await this.user.getDisplayName()
        await this.messages.send({ action: 'emojiswap:accept-swap', fromID, fromName, emoji: StateBridge.shared.state.myEmoji }, false, msgFromID)

        // Notify we collected their emoji
        this.onEmojiCollected(msg.emoji, msgFromID, msg.fromName)

    }

    /** Called when the user rejects a swap request */
    async onRejectSwapRequest(msg, msgFromID) {

        // Send rejection back to the other user
        let fromID = await this.user.getID()
        let fromName = await this.user.getDisplayName()
        await this.messages.send({ action: 'emojiswap:reject-swap', fromID, fromName }, false, msgFromID)

    }

    /** Called when we collect an emoji from another user */
    async onEmojiCollected(emoji, fromID, fromName) {

        // Check if we already have an emoji from this user
        if (StateBridge.shared.state.collectedEmojis.find(e => e.fromID == fromID)) 
            return

        // Add emoji to our list
        StateBridge.shared.state.collectedEmojis.push({ emoji, fromID, fromName })

        // Update score
        StateBridge.shared.state.score += 1

        // Notify state updated
        StateBridge.shared.updateState()

        // Show toast
        if (this.lastToastID) this.menus.closeToast(this.lastToastID)
        this.lastToastID = await this.menus.toast({ text: `You collected ${emoji} from <b>${fromName}</b>!` })

        // Send updated score to Vatom
        try {

            // Stop if no campaign ID
            let campaignID = this.getField('campaign_id')
            let channel = this.getField('points_channel') || 'emojiswap'
            if (!campaignID)
                throw new Error("No campaign ID specified in the plugin settings.")

            // Send score update
            let response = await this.hooks.trigger('vatoms.campaigns.points.add', { campaignID, channel, points: 1 })
            if (!response)
                throw new Error("Failed to update score, is the Vatom plugin installed?")

            // Fix score in case it changes
            this.fetchScore()

        } catch (err) {

            // Show error
            console.error(`[Emoji Swap] Failed to update score, undoing update: ${err.message}`)
            this.menus.alert(err.message, "Unable to update score", 'error')

            // Undo the score update
            StateBridge.shared.state.score -= 1
            StateBridge.shared.state.collectedEmojis = StateBridge.shared.state.collectedEmojis.filter(e => e.fromID != fromID)
            StateBridge.shared.updateState()

        }

        // Update saved emojis
        await this.user.setProperties({ collected_emojis: StateBridge.shared.state.collectedEmojis })

    }

}