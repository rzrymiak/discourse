import { test } from "qunit";
import I18n from "I18n";
import { click, currentURL, visit } from "@ember/test-helpers";
import {
  acceptance,
  count,
  exists,
  publishToMessageBus,
  query,
  updateCurrentUser,
} from "discourse/tests/helpers/qunit-helpers";
import { NotificationLevels } from "discourse/lib/notification-levels";

acceptance(
  "Sidebar - Messages Section - enable_personal_messages disabled",
  function (needs) {
    needs.user({
      experimental_sidebar_enabled: true,
    });

    needs.settings({
      enable_personal_messages: false,
    });

    test("clicking on section header button", async function (assert) {
      await visit("/");

      assert.ok(
        !exists(".sidebar-section-messages"),
        "does not display messages section in sidebar"
      );
    });
  }
);

acceptance(
  "Sidebar - Messages Section - enable_personal_messages enabled",
  function (needs) {
    needs.user({
      experimental_sidebar_enabled: true,
    });

    needs.pretender((server, helper) => {
      [
        "/topics/private-messages-new/:username.json",
        "/topics/private-messages-unread/:username.json",
        "/topics/private-messages-archive/:username.json",
        "/topics/private-messages-sent/:username.json",
        "/topics/private-messages-group/:username/:group_name/new.json",
        "/topics/private-messages-group/:username/:group_name.json",
        "/topics/private-messages-group/:username/:group_name/unread.json",
        "/topics/private-messages-group/:username/:group_name/archive.json",
      ].forEach((url) => {
        server.get(url, () => {
          const topics = [
            { id: 1, posters: [] },
            { id: 2, posters: [] },
            { id: 3, posters: [] },
          ];

          return helper.response({
            topic_list: {
              topics,
            },
          });
        });
      });
    });

    test("clicking on section header button", async function (assert) {
      await visit("/");
      await click(".sidebar-section-messages .sidebar-section-header-button");

      assert.ok(
        exists("#reply-control.private-message"),
        "it opens the composer"
      );
    });

    test("clicking on section header link", async function (assert) {
      await visit("/");
      await click(".sidebar-section-messages .sidebar-section-header-link");

      assert.strictEqual(
        currentURL(),
        `/u/eviltrout/messages`,
        "it should transition to the user's messages"
      );
    });

    test("personal messages section links", async function (assert) {
      await visit("/");

      assert.ok(
        exists(
          ".sidebar-section-messages .sidebar-section-link-personal-messages-inbox"
        ),
        "displays the personal message inbox link"
      );

      assert.strictEqual(
        count(".sidebar-section-messages .sidebar-section-link"),
        1,
        "only displays the personal message inbox link"
      );

      await click(
        ".sidebar-section-messages .sidebar-section-link-personal-messages-inbox"
      );

      assert.ok(
        exists(
          ".sidebar-section-messages .sidebar-section-link-personal-messages-inbox.active"
        ),
        "personal message inbox link is marked as active"
      );

      assert.strictEqual(
        count(".sidebar-section-messages .sidebar-section-link"),
        5,
        "expands and displays the links for personal messages"
      );
    });

    ["new", "archive", "sent", "unread"].forEach((type) => {
      test(`${type} personal messages section link`, async function (assert) {
        await visit("/");

        await click(
          ".sidebar-section-messages .sidebar-section-link-personal-messages-inbox"
        );

        await click(
          `.sidebar-section-messages .sidebar-section-link-personal-messages-${type}`
        );

        assert.strictEqual(
          currentURL(),
          `/u/eviltrout/messages/${type}`,
          `it should transition to user's ${type} personal messages`
        );

        assert.strictEqual(
          count(".sidebar-section-messages .sidebar-section-link.active"),
          2,
          "only two links are marked as active in the sidebar"
        );

        assert.ok(
          exists(
            ".sidebar-section-messages .sidebar-section-link-personal-messages-inbox.active"
          ),
          "personal message inbox link is marked as active"
        );

        assert.ok(
          exists(
            `.sidebar-section-messages .sidebar-section-link-personal-messages-${type}.active`
          ),
          `personal message ${type} link is marked as active`
        );
      });
    });

    test("group messages section links", async function (assert) {
      updateCurrentUser({
        groups: [
          {
            name: "group1",
            has_messages: true,
          },
          {
            name: "group2",
            has_messages: false,
          },
          {
            name: "group3",
            has_messages: true,
          },
        ],
      });

      await visit("/");

      assert.ok(
        exists(
          ".sidebar-section-messages .sidebar-section-link-group-messages-inbox.group1"
        ),
        "displays group1 inbox link"
      );

      assert.ok(
        exists(
          ".sidebar-section-messages .sidebar-section-link-group-messages-inbox.group3"
        ),
        "displays group3 inbox link"
      );

      await visit("/u/eviltrout/messages/group/GrOuP1");

      assert.strictEqual(
        count(".sidebar-section-messages .sidebar-section-link"),
        6,
        "expands and displays the links for group1 group messages"
      );

      assert.strictEqual(
        count(".sidebar-section-messages .sidebar-section-link.group1"),
        4,
        "expands the links for group1 group messages"
      );

      await click(
        ".sidebar-section-messages .sidebar-section-link-group-messages-inbox.group3"
      );

      assert.strictEqual(
        count(".sidebar-section-messages .sidebar-section-link.group1"),
        1,
        "collapses the links for group1 group messages"
      );

      assert.strictEqual(
        count(".sidebar-section-messages .sidebar-section-link.group3"),
        4,
        "expands the links for group3 group messages"
      );
    });

    ["new", "archive", "unread"].forEach((type) => {
      test(`${type} group messages section link`, async function (assert) {
        updateCurrentUser({
          groups: [
            {
              name: "group1",
              has_messages: true,
            },
            {
              name: "group2",
              has_messages: false,
            },
            {
              name: "group3",
              has_messages: true,
            },
          ],
        });

        await visit("/");

        await click(
          `.sidebar-section-messages .sidebar-section-link-group-messages-inbox.group1`
        );

        await click(
          `.sidebar-section-messages .sidebar-section-link-group-messages-${type}.group1`
        );

        assert.strictEqual(
          currentURL(),
          `/u/eviltrout/messages/group/group1/${type}`,
          `it should transition to user's ${type} personal messages`
        );

        assert.strictEqual(
          count(".sidebar-section-messages .sidebar-section-link.active"),
          2,
          "only two links are marked as active in the sidebar"
        );

        assert.ok(
          exists(
            ".sidebar-section-messages .sidebar-section-link-group-messages-inbox.group1.active"
          ),
          "group1 group message inbox link is marked as active"
        );

        assert.ok(
          exists(
            `.sidebar-section-messages .sidebar-section-link-group-messages-${type}.group1.active`
          ),
          `group1 group message ${type} link is marked as active`
        );
      });
    });

    test("viewing personal message topic with a group the user is a part of", async function (assert) {
      updateCurrentUser({
        groups: [
          {
            name: "foo_group", // based on fixtures
            has_messages: true,
          },
        ],
      });

      await visit("/t/130");

      assert.strictEqual(
        count(".sidebar-section-messages .sidebar-section-link"),
        5,
        "5 section links are displayed"
      );

      assert.strictEqual(
        count(
          ".sidebar-section-messages .sidebar-section-link.personal-messages"
        ),
        1,
        "personal messages inbox filter links are not shown"
      );

      assert.strictEqual(
        count(".sidebar-section-messages .sidebar-section-link.foo_group"),
        4,
        "foo_group messages inbox filter links are shown"
      );
    });

    test("viewing personal message topic", async function (assert) {
      updateCurrentUser({
        groups: [
          {
            name: "foo_group", // based on fixtures
            has_messages: true,
          },
        ],
      });

      await visit("/t/34");

      assert.strictEqual(
        count(".sidebar-section-messages .sidebar-section-link"),
        6,
        "6 section links are displayed"
      );

      assert.strictEqual(
        count(
          ".sidebar-section-messages .sidebar-section-link.personal-messages"
        ),
        5,
        "personal messages inbox filter links are shown"
      );

      assert.strictEqual(
        count(".sidebar-section-messages .sidebar-section-link.foo_group"),
        1,
        "foo_group messages inbox filter links are not shown"
      );
    });

    test("new and unread counts for group messages", async function (assert) {
      updateCurrentUser({
        groups: [
          {
            id: 1,
            name: "group1",
            has_messages: true,
          },
        ],
      });

      await visit("/");

      const pmTopicTrackingState = this.container.lookup(
        "pm-topic-tracking-state:main"
      );

      await publishToMessageBus(pmTopicTrackingState.groupChannel(1), {
        topic_id: 1,
        message_type: "unread",
        payload: {
          last_read_post_number: 1,
          highest_post_number: 2,
          notification_level: NotificationLevels.TRACKING,
          group_ids: [1],
        },
      });

      await publishToMessageBus(pmTopicTrackingState.groupChannel(1), {
        topic_id: 2,
        message_type: "new_topic",
        payload: {
          last_read_post_number: null,
          highest_post_number: 1,
          notification_level: NotificationLevels.TRACKING,
          group_ids: [1],
        },
      });

      await click(
        ".sidebar-section-messages .sidebar-section-link-group-messages-inbox.group1"
      );

      assert.strictEqual(
        query(
          ".sidebar-section-messages .sidebar-section-link-group-messages-unread.group1"
        ).textContent.trim(),
        I18n.t("sidebar.sections.messages.links.unread_with_count", {
          count: 1,
        }),
        "displays 1 count for group1 unread inbox filter link"
      );

      assert.strictEqual(
        query(
          ".sidebar-section-messages .sidebar-section-link-group-messages-new.group1"
        ).textContent.trim(),
        I18n.t("sidebar.sections.messages.links.new_with_count", {
          count: 1,
        }),
        "displays 1 count for group1 new inbox filter link"
      );

      await publishToMessageBus(pmTopicTrackingState.groupChannel(1), {
        topic_id: 2,
        message_type: "read",
        payload: {
          last_read_post_number: 1,
          highest_post_number: 1,
          notification_level: NotificationLevels.TRACKING,
          group_ids: [1],
        },
      });

      assert.strictEqual(
        query(
          ".sidebar-section-messages .sidebar-section-link-group-messages-new.group1"
        ).textContent.trim(),
        I18n.t("sidebar.sections.messages.links.new"),
        "removes count for group1 new inbox filter link"
      );
    });

    test("new and unread counts for personal messages", async function (assert) {
      await visit("/");

      const pmTopicTrackingState = this.container.lookup(
        "pm-topic-tracking-state:main"
      );

      await publishToMessageBus(pmTopicTrackingState.userChannel(), {
        topic_id: 1,
        message_type: "unread",
        payload: {
          last_read_post_number: 1,
          highest_post_number: 2,
          notification_level: NotificationLevels.TRACKING,
          group_ids: [],
        },
      });

      await click(
        ".sidebar-section-messages .sidebar-section-link-personal-messages-inbox"
      );

      assert.strictEqual(
        query(
          ".sidebar-section-messages .sidebar-section-link-personal-messages-unread"
        ).textContent.trim(),
        I18n.t("sidebar.sections.messages.links.unread_with_count", {
          count: 1,
        }),
        "displays 1 count for the unread inbox filter link"
      );

      await publishToMessageBus(pmTopicTrackingState.userChannel(), {
        topic_id: 2,
        message_type: "unread",
        payload: {
          last_read_post_number: 1,
          highest_post_number: 2,
          notification_level: NotificationLevels.TRACKING,
          group_ids: [],
        },
      });

      assert.strictEqual(
        query(
          ".sidebar-section-messages .sidebar-section-link-personal-messages-unread"
        ).textContent.trim(),
        I18n.t("sidebar.sections.messages.links.unread_with_count", {
          count: 2,
        }),
        "displays 2 count for the unread inbox filter link"
      );

      await publishToMessageBus(pmTopicTrackingState.userChannel(), {
        topic_id: 3,
        message_type: "new_topic",
        payload: {
          last_read_post_number: null,
          highest_post_number: 1,
          notification_level: NotificationLevels.TRACKING,
          group_ids: [],
        },
      });

      assert.strictEqual(
        query(
          ".sidebar-section-messages .sidebar-section-link-personal-messages-new"
        ).textContent.trim(),
        I18n.t("sidebar.sections.messages.links.new_with_count", {
          count: 1,
        }),
        "displays 1 count for the new inbox filter link"
      );

      await publishToMessageBus(pmTopicTrackingState.userChannel(), {
        topic_id: 3,
        message_type: "read",
        payload: {
          last_read_post_number: 1,
          highest_post_number: 1,
          notification_level: NotificationLevels.TRACKING,
          group_ids: [],
        },
      });

      assert.strictEqual(
        query(
          ".sidebar-section-messages .sidebar-section-link-personal-messages-new"
        ).textContent.trim(),
        I18n.t("sidebar.sections.messages.links.new"),
        "removes the count from the new inbox filter link"
      );
    });
  }
);
