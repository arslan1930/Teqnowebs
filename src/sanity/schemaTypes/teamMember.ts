import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description: "Square headshot works best. Leave empty to show initials.",
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Describe the person for accessibility.",
        }),
      ],
    }),
    defineField({
      name: "group",
      title: "Team group",
      type: "string",
      options: {
        list: [
          { title: "Leadership & Tech", value: "leadership-tech" },
          { title: "Growth & Outreach", value: "growth-outreach" },
          { title: "Content & SEO", value: "content-seo" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers appear first within the group.",
      initialValue: 0,
    }),
    defineField({
      name: "active",
      title: "Show on site",
      type: "boolean",
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: "Group, then order",
      name: "groupOrder",
      by: [
        { field: "group", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "photo",
      active: "active",
    },
    prepare({ title, subtitle, media, active }) {
      return {
        title,
        media,
        subtitle: `${active === false ? "Hidden · " : ""}${subtitle || ""}`,
      };
    },
  },
});
