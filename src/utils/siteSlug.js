// URL-safe id for a Policy Outlook site, e.g. "Burren, Co. Clare" -> "burren-co-clare"
export const siteSlug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
