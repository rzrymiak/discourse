import I18n from "I18n";

import { tracked } from "@glimmer/tracking";

import { bind } from "discourse-common/utils/decorators";

export default class TagSectionLink {
  @tracked totalUnread = 0;
  @tracked totalNew = 0;

  constructor({ tagName, topicTrackingState }) {
    this.tagName = tagName;
    this.topicTrackingState = topicTrackingState;
    this.refreshCounts();
  }

  @bind
  refreshCounts() {
    this.totalUnread = this.topicTrackingState.countUnread({
      tagId: this.tagName,
    });

    if (this.totalUnread === 0) {
      this.totalNew = this.topicTrackingState.countNew({
        tagId: this.tagName,
      });
    }
  }

  get name() {
    return this.tagName;
  }

  get model() {
    return this.tagName;
  }

  get currentWhen() {
    return "tag.show tag.showNew tag.showUnread tag.showTop";
  }

  get route() {
    return "tag.show";
  }

  get text() {
    return this.tagName;
  }

  get badgeText() {
    if (this.totalUnread > 0) {
      return I18n.t("sidebar.unread_count", {
        count: this.totalUnread,
      });
    } else if (this.totalNew > 0) {
      return I18n.t("sidebar.new_count", {
        count: this.totalNew,
      });
    }
  }

  get route() {
    if (this.totalUnread > 0) {
      return "tag.showUnread";
    } else if (this.totalNew > 0) {
      return "tag.showNew";
    } else {
      return "tag.show";
    }
  }
}
