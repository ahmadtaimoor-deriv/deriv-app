import { translate } from '../../utils/lang/i18n';

/* eslint-disable func-names, no-underscore-dangle */

/**
 * Set whether the block is disabled or not.
 * @param {boolean} disabled True if disabled.
 * deriv-bot: Call updateDisabled() when setDisabled is called.
 */
Blockly.BlockSvg.prototype.setDisabled = function(disabled) {
    if (this.disabled !== disabled) {
        Blockly.BlockSvg.superClass_.setDisabled.call(this, disabled);
        if (this.rendered) {
            this.updateDisabled();
        }
    }
};

/**
 * Enable or disable a block.
 */
Blockly.BlockSvg.prototype.updateDisabled = function() {
    if (this.disabled || this.getInheritedDisabled()) {
        const added = Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_), 'blocklyDisabled');
        if (added) {
            this.svgPath_.setAttribute('fill', `url(#${this.workspace.options.disabledPatternId})`);
        }
    } else {
        const removed = Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_), 'blocklyDisabled');
        if (removed) {
            this.updateColour();
        }
    }
    const children = this.getChildren(false);
    children.forEach(child => {
        child.updateDisabled();
    });
};

/**
 * Show the context menu for this block.
 * @param {!Event} e Mouse event.
 * @private
 * deriv-bot: Restore contextMenu options from Blockly unavailable in Scratch
 */
Blockly.BlockSvg.prototype.showContextMenu_ = function(e) {
    if (this.workspace.options.readOnly || !this.contextMenu) {
        return;
    }
    // Save the current block in a variable for use in closures.
    const block = this;
    const menuOptions = [];

    if (this.isDeletable() && this.isMovable() && !block.isInFlyout) {
        menuOptions.push(Blockly.ContextMenu.blockDuplicateOption(block, e));

        if (this.isEditable() && this.workspace.options.comments) {
            menuOptions.push(Blockly.ContextMenu.blockCommentOption(block));
        }

        menuOptions.push(Blockly.ContextMenu.blockDeleteOption(block));
    } else if (this.parentBlock_ && this.isShadow_) {
        this.parentBlock_.showContextMenu_(e);
        return;
    }

    // Option to collapse/expand block.
    if (this.workspace.options.collapse) {
        if (this.collapsed_) {
            const expandOption = { enabled: true };
            expandOption.text = translate('Expand Block');
            expandOption.callback = function() {
                block.setCollapsed(false);
            };
            menuOptions.push(expandOption);
        } else {
            const collapseOption = { enabled: true };
            collapseOption.text = translate('Collapse Block');
            collapseOption.callback = function() {
                block.setCollapsed(true);
            };
            menuOptions.push(collapseOption);
        }
    }

    // Option to disable/enable block.
    if (this.workspace.options.disable) {
        const disableOption = {
            text   : this.disabled ? translate('Enable Block') : translate('Disable Block'),
            enabled: !this.getInheritedDisabled(),
            callback() {
                const group = Blockly.Events.getGroup();

                if (!group) {
                    Blockly.Events.setGroup(true);
                }

                block.setDisabled(!block.disabled);

                if (!group) {
                    Blockly.Events.setGroup(false);
                }
            },
        };
        menuOptions.push(disableOption);

        // Allow the block to add or modify menuOptions.
        if (this.customContextMenu) {
            this.customContextMenu(menuOptions);
        }

        Blockly.ContextMenu.show(e, menuOptions, this.RTL);
        Blockly.ContextMenu.currentBlock = this;
    }
};

/**
 * Set whether the block is error highlighted or not.
 * @param {boolean} highlighted True if highlighted for error.
 */
Blockly.BlockSvg.prototype.setErrorHighlighted = function(should_be_error_highlighted) {
    const highlight_class = 'block--error-highlighted';

    if (should_be_error_highlighted) {
        // Below function does its own checks to check if class already exists.
        Blockly.utils.addClass(this.svgGroup_, highlight_class);
    } else {
        Blockly.utils.removeClass(this.svgGroup_, highlight_class);
    }

    this.is_error_highlighted = should_be_error_highlighted;
};
