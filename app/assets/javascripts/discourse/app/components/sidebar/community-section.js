import GlimmerComponent from "discourse/components/glimmer";
import Composer from "discourse/models/composer";
import { getOwner } from "discourse-common/lib/get-owner";
import PermissionType from "discourse/models/permission-type";
import { customSectionLinks } from "discourse/lib/sidebar/custom-community-section-links";
import EverythingSectionLink from "discourse/lib/sidebar/community-section/everything-section-link";
import TrackedSectionLink from "discourse/lib/sidebar/community-section/tracked-section-link";
import MyPostsSectionLink from "discourse/lib/sidebar/community-section/my-posts-section-link";
import GroupsSectionLink from "discourse/lib/sidebar/community-section/groups-section-link";
import UsersSectionLink from "discourse/lib/sidebar/community-section/users-section-link";

import { action } from "@ember/object";
import { next } from "@ember/runloop";

const DEFAULT_SECTION_LINKS = [
  EverythingSectionLink,
  TrackedSectionLink,
  GroupsSectionLink,
  UsersSectionLink,
  MyPostsSectionLink,
];

export default class SidebarCommunitySection extends GlimmerComponent {
  configuredSectionLinks = [...DEFAULT_SECTION_LINKS, ...customSectionLinks];

  sectionLinks = this.configuredSectionLinks.map((sectionLinkClass) => {
    return new sectionLinkClass({
      topicTrackingState: this.topicTrackingState,
      currentUser: this.currentUser,
      appEvents: this.appEvents,
    });
  });

  willDestroy() {
    this.sectionLinks.forEach((sectionLink) => sectionLink.teardown());
  }

  @action
  composeTopic() {
    const composerArgs = {
      action: Composer.CREATE_TOPIC,
      draftKey: Composer.NEW_TOPIC_KEY,
    };

    const controller = getOwner(this).lookup("controller:navigation/category");
    const category = controller.category;

    if (category && category.permission === PermissionType.FULL) {
      composerArgs.categoryId = category.id;
    }

    next(() => {
      getOwner(this).lookup("controller:composer").open(composerArgs);
    });
  }
}
