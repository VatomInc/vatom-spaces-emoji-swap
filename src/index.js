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
            leaderboard: [],
            campaignID: this.getField('campaign_id') || '',
            channel: this.getField('points_channel') || 'emojiswap',
        }
        
        // Update state
        this.onSettingsUpdated()

    }

    /** Called when settings change and on first load */
    onSettingsUpdated() {

        // Update state values
        StateBridge.shared.state.campaignID = this.getField('campaign_id') || '',
        StateBridge.shared.state.channel = this.getField('points_channel') || 'emojiswap',

        // Update state
        this.fetchEmojis()
        this.fetchScore()
        this.fetchLeaderboard()

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
        let collectedEmojis = await this.user.getProperty(null, 'space:collected_emojis')
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
            StateBridge.shared.state.score = score[channel] || 0
            console.debug(`[Emoji Swap] Got score: channel=${channel} score=${score[channel] || 0}`)

        } catch (err) {
            console.warn(`[Emoji Swap] Failed to get score: ${err.message}`)
        }

        // Notify state updated
        StateBridge.shared.updateState()

    }

    /** (bridged) Fetch the leaderboard */
    fetchLeaderboard = StateBridge.shared.register('fetchLeaderboard', async () => {

        // Catch errors
        try {
            
            // Get fields
            let campaignID = this.getField('campaign_id')
            let channel = this.getField('points_channel') || 'emojiswap'
            if (!campaignID) 
                throw new Error("No Campaign ID set in the plugin settings.")

            // Send request
            let response = await this.hooks.trigger('vatoms.campaigns.points.leaderboard', { campaignID, channel, limit: 10 })
            if (!response?.items)
                throw new Error("No items returned from leaderboard request.")

            // Fetch all user info
            let leaderboard = []
            await Promise.allSettled(response.items.map(item => (async () => {

                // Fetch user information
                let user = await fetch(`https://users.vatom.com/${item.id}`).then(r => r.json())

                // Store user info
                leaderboard.push({
                    userID: item.id,
                    points: item.points,
                    username: user.preferred_username || item.id,
                    name: user.name || `Guest (${item.id})`,
                    picture: user.picture,
                })

            })()))

            // Sort by points descending
            leaderboard.sort((a, b) => b.points - a.points)

            // Done!
            StateBridge.shared.state.leaderboard = leaderboard
            StateBridge.shared.updateState()

        } catch (err) {
            console.warn(`[Emoji Swap] Failed to get leaderboard: ${err.message}`)
        }

    })

    /** (bridged) Show an alert dialog */
    showAlert = StateBridge.shared.register('showAlert', async (msg, title, icon) => {
        await this.menus.alert(msg, title, icon)
    })

    /** Called when the user presses Swap Emoji in the people menu */
    async onSwapEmoji(e) {

        // Show toast
        if (this.lastToastID) this.menus.closeToast(this.lastToastID)
        this.lastToastID = await this.menus.toast({ text: 'Swap request sent...', duration: 5000 })

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
            this.lastToastID = await this.menus.toast({ text: msg.owned ? `<b>${msg.fromName}</b> has already received an emoji from you.` : `<b>${msg.fromName}</b> rejected your emoji swap.`, duration: 5000 })

        } else if (msg.action == 'emojiswap:accept-swap') {

            // Notify we collected their emoji
            this.onEmojiCollected(msg.emoji, fromID, msg.fromName, true)

        }

    }

    /** Called when a remote user wants to swap emojis with us */
    async onIncomingSwapRequest(msg, fromID) {

        // Check if we already have an emoji from this user
        if (StateBridge.shared.state.collectedEmojis.find(e => e.fromID == fromID && e.campaignID == StateBridge.shared.state.campaignID && e.channel == StateBridge.shared.state.channel)) {

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
            isSticky: true,
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
        this.onEmojiCollected(msg.emoji, msgFromID, msg.fromName, false)

    }

    /** Called when the user rejects a swap request */
    async onRejectSwapRequest(msg, msgFromID) {

        // Send rejection back to the other user
        let fromID = await this.user.getID()
        let fromName = await this.user.getDisplayName()
        await this.messages.send({ action: 'emojiswap:reject-swap', fromID, fromName }, false, msgFromID)

    }

    /** Called when we collect an emoji from another user */
    async onEmojiCollected(emoji, fromID, fromName, isInitiator) {

        // Check if we already have an emoji from this user
        let campaignID = this.getField('campaign_id')
        let channel = this.getField('points_channel') || 'emojiswap'
        let isNewEmoji = !StateBridge.shared.state.collectedEmojis.find(e => e.emoji == emoji && e.campaignID == campaignID && e.channel == channel)
        let addScore = isNewEmoji ? 10 : 1
        if (StateBridge.shared.state.collectedEmojis.find(e => e.fromID == fromID && e.campaignID == campaignID && e.channel == channel)) 
            return

        // Add emoji to our list and update the score
        StateBridge.shared.state.collectedEmojis.push({ emoji, fromID, fromName, campaignID, channel })
        StateBridge.shared.state.score += addScore
        StateBridge.shared.updateState()

        // Show toast
        if (this.lastToastID) this.menus.closeToast(this.lastToastID)
        this.lastToastID = await this.menus.toast({ text: `You collected ${emoji} from <b>${fromName}</b>!`, duration: 5000 })

        // Send updated score to Vatom
        try {

            // Check if we're the initiator
            if (isInitiator) {

                // Get sender ID for analytics
                let senderID = await this.user.getID()
                if (senderID.startsWith('vatominc:')) senderID = senderID.substring(9)

                // Get recipient ID for analytics
                let recipientID = fromID
                if (recipientID.startsWith('vatominc:')) recipientID = recipientID.substring(9)

                // Send analytics event
                this.user.sendAnalytics('com.vatom.emojiswap:emoji-swapped', `${emoji}+${senderID}+${recipientID}`)

            }

            // Stop if no campaign ID
            if (!campaignID)
                throw new Error("No campaign ID specified in the plugin settings.")

            // Send score update
            let response = await this.hooks.trigger('vatoms.campaigns.points.add', { campaignID, channel, points: addScore })
            if (!response)
                throw new Error("Failed to update score, is the Vatom plugin installed?")

        } catch (err) {

            // Show error
            console.error(`[Emoji Swap] Failed to update score, undoing update: ${err.message}`)
            this.menus.alert(err.message, "Unable to update score", 'error')

            // Undo the score update
            StateBridge.shared.state.score -= addScore
            StateBridge.shared.state.collectedEmojis = StateBridge.shared.state.collectedEmojis.filter(e => e.fromID != fromID && e.campaignID == campaignID && e.channel == channel)
            StateBridge.shared.updateState()

        }

        // Update saved emojis
        await this.user.setProperties({ 'space:collected_emojis': StateBridge.shared.state.collectedEmojis })

        // Fix score in case it changes
        this.fetchScore()

    }

}