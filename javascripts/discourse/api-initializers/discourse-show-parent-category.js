import { get } from "@ember/object";
import { htmlSafe } from "@ember/template";
import { defaultCategoryLinkRenderer } from "discourse/helpers/category-link";
import categoryVariables from "discourse/helpers/category-variables";
import { apiInitializer } from "discourse/lib/api";
import { escapeExpression } from "discourse/lib/utilities";
import Category from "discourse/models/category";
import getURL from "discourse-common/lib/get-url";
import { helperContext, registerRawHelper } from "discourse-common/lib/helpers";
import { iconHTML } from "discourse-common/lib/icon-library";
import I18n from "discourse-i18n";

function buildTopicCount(count) {
  return `<span class="topic-count" aria-label="${I18n.t(
    "category_row.topic_count",
    { count }
  )}">&times; ${count}</span>`;
}

export default apiInitializer("1.8.0", (api) => {
  api.replaceCategoryLinkRenderer((category, opts) => {
    const defaultHtml = defaultCategoryLinkRenderer(category, opts);

    if (opts.hideParent) {
      return defaultHtml;
    }

    const parentCat = Category.findById(get(category, "parent_category_id"));

    if (!parentCat) {
      return defaultHtml;
    }

    let descriptionText = escapeExpression(get(parentCat, "description_text"));
    let restricted = get(parentCat, "read_restricted");
    let url = opts.url
      ? opts.url
      : getURL(`/c/${Category.slugFor(parentCat)}/${get(parentCat, "id")}`);
    let href = opts.link === false ? "" : url;
    let tagName = opts.link === false || opts.link === "false" ? "span" : "a";
    let extraClasses = opts.extraClasses ? " " + opts.extraClasses : "";
    let style = `${categoryVariables(parentCat)}`;
    let html = "";
    let categoryDir = "";
    let dataAttributes = `data-category-id="${get(parentCat, "id")}"`;

    let siteSettings = helperContext().siteSettings;

    let classNames = `badge-category`;
    if (restricted) {
      classNames += " restricted";
    }

    html += `<span
    ${dataAttributes}      
    data-drop-close="true"
    class="${classNames}"
    ${
      opts.previewColor
        ? `style="--category-badge-color: #${parentCat.color}"`
        : ""
    }
    ${descriptionText ? 'title="' + descriptionText + '" ' : ""}
  >`;

    let categoryName = escapeExpression(get(parentCat, "name"));

    if (siteSettings.support_mixed_text_direction) {
      categoryDir = 'dir="auto"';
    }

    if (restricted) {
      html += iconHTML("lock");
    }

    html += `<span class="badge-category__name" ${categoryDir}>${categoryName}</span>`;
    html += "</span>";

    if (href) {
      href = ` href="${href}" `;
    }

    return (
      `<${tagName} class="badge-category__wrapper ${extraClasses}" ${
        style.length > 0 ? `style="${style}"` : ""
      } ${href}>${html}</${tagName}>` + defaultHtml.replace("--has-parent", "")
    );
  });
});
