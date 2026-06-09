/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "heroHeading",
      type: "string",
      required: false,
      label: "Hero Heading",
    },
    {
      fieldName: "heroSubheading",
      type: "string",
      required: false,
      label: "Hero Subheading",
    },
    {
      fieldName: "heroCta",
      type: "string",
      required: false,
      label: "Hero CTA Button Text",
    },
    {
      fieldName: "featuresSection",
      type: "object",
      required: false,
      label: "Features Section",
      fields: [
        { fieldName: "title", type: "string", required: false, label: "Section Title" },
        {
          fieldName: "items",
          type: "array",
          required: false,
          label: "Feature Items",
          item: {
            type: "object",
            fields: [
              { fieldName: "title", type: "string", required: true, label: "Feature Title" },
              { fieldName: "description", type: "string", required: true, label: "Feature Description" },
              { fieldName: "icon", type: "string", required: false, label: "Icon Name (lucide)" },
            ],
          },
        },
      ],
    },
    {
      fieldName: "stepsSection",
      type: "object",
      required: false,
      label: "How It Works Section",
      fields: [
        { fieldName: "title", type: "string", required: false, label: "Section Title" },
        {
          fieldName: "steps",
          type: "array",
          required: false,
          label: "Steps",
          item: {
            type: "object",
            fields: [
              { fieldName: "number", type: "string", required: true, label: "Step Number" },
              { fieldName: "title", type: "string", required: true, label: "Step Title" },
              { fieldName: "description", type: "string", required: false, label: "Step Description" },
            ],
          },
        },
      ],
    },
    {
      fieldName: "footerText",
      type: "string",
      required: false,
      label: "Footer Text",
    },
    {
      fieldName: "loginPageTitle",
      type: "string",
      required: false,
      label: "Login Page Title",
    },
    {
      fieldName: "registerPageTitle",
      type: "string",
      required: false,
      label: "Register Page Title",
    },
    {
      fieldName: "cvUploadLabel",
      type: "string",
      required: false,
      label: "CV Upload Label",
    },
    {
      fieldName: "jobInputLabel",
      type: "string",
      required: false,
      label: "Job Description Input Label",
    },
    {
      fieldName: "analyzeCtaLabel",
      type: "string",
      required: false,
      label: "Analyze CTA Label",
    },
    {
      fieldName: "mockInterviewStartLabel",
      type: "string",
      required: false,
      label: "Mock Interview Start Button Label",
    },
    {
      fieldName: "downloadCvLabel",
      type: "string",
      required: false,
      label: "Download CV Button Label",
    },
    {
      fieldName: "showTestimonialsSection",
      type: "boolean",
      required: false,
      label: "Show Testimonials Section",
    },
  ],
};