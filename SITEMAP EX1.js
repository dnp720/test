SalesforceInteractions.init({
    cookieDomain: "northerntrailoutfitters.com",
    consents: [
        {
            purpose: SalesforceInteractions.mcis.ConsentPurpose.Personalization,
            provider: "Example Consent Manager",
            status: SalesforceInteractions.ConsentStatus.OptIn,
        },
    ],
}).then(() => {
    const sitemapConfig = {
        global: {
            onActionEvent: (actionEvent) => {
                const email = SalesforceInteractions.mcis.getValueFromNestedObject(
                    "window._etmc.user_info.email",
                );
                if (email) {
                    actionEvent.user = actionEvent.user || {};
                    actionEvent.user.identities = actionEvent.user.identities || {};
                    actionEvent.user.identities.emailAddress = email;
                }
                return actionEvent;
            },
            contentZones: [
                { name: "global_infobar_top_of_page", selector: "header.site-header" },
                { name: "global_infobar_bottom_of_page", selector: "footer.site-footer" },
            ],
            listeners: [
                SalesforceInteractions.listener("submit", ".email-signup", () => {
                    const email = SalesforceInteractions.cashDom("#dwfrm_mcsubscribe_email").val();
                    if (email) {
                        SalesforceInteractions.sendEvent({
                            interaction: { name: "Email Sign Up - Footer" },
                            user: { identities: { emailAddress: email } },
                        });
                    }
                }),
            ],
        },
        pageTypeDefault: {
            name: "default",
            interaction: {
                name: "Default Page",
            },
        },
        pageTypes: [
            {
               name: "Woman Outfits",
               action: "Woman Outfits",
               isMatch: () => window.location.pathname === '/default/women',
               listeners:[
                   SalesforceInteractions.listener("click","a[class='category-tile-link text-reset']", () => {
                    SalesforceInteractions.sendEvent({
                        interaction: {name: "Outfit Clicked: "+document.querySelectorAll("a[class='category-tile-link text-reset']")[0].innerText},
                       // interaction: {name: "Outfit Clicked"},
                        });
                    }),
                ],
           },
           {
               name: "Woman Outfits Chosen",
               action: "Woman Outfits Chosen",
               isMatch: () => window.location.pathname.length > 14,
               listeners:[
                  SalesforceInteractions.listener("click",'div[class="pdp-link"]', () => {
                    SalesforceInteractions.sendEvent({
                        interaction: { name: "Specific Item is Clicked: " + document.querySelectorAll('div[class="pdp-link"]')[0].innerText},
                        });
                    }),
                    SalesforceInteractions.listener("click","i[class='far fa-heart']", () => {
                    SalesforceInteractions.sendEvent({
                        interaction: { name: SalesforceInteractions.CartInteractionName.AddToCart},
                        });
                    }),
                    SalesforceInteractions.listener("click","i[class='far fa-heart']", () => {
                    SalesforceInteractions.sendEvent({
                        interaction: { name: "Added to Wishlist"},
                        user: { identities: { name: 'Test User' } }
                        });
                    }),
                ],
           },
        /*{
                name: "product_detail",
                isMatch: () =>
                    new Promise((resolve, reject) => {
                        let isMatchPDP = setTimeout(() => {
                            resolve(false);
                        }, 50);
                        return SalesforceInteractions.DisplayUtils.pageElementLoaded(
                            "div.page[data-action='Product-Show']",
                            "html",
                        ).then(() => {
                            clearTimeout(isMatchPDP);
                            resolve(true);
                        });
                    }),
                interaction: {
                    name: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject,
                    catalogObject: {
                        type: "Product",
                        id: () => {
                            return SalesforceInteractions.util.resolveWhenTrue.bind(() => {
                                const productId = SalesforceInteractions.cashDom(".product-id").first().text();
                                const products = getProductsFromDataLayer();
                                if (products && products.length > 0) {
                                    return products[0].id;
                                } else if (productId) {
                                    return productId;
                                } else {
                                    return false;
                                }
                            });
                        },
                        attributes: {
                            sku: {
                                id: SalesforceInteractions.cashDom(".product-detail[data-pid]").attr("data-pid"),
                            },
                            name: SalesforceInteractions.resolvers.fromJsonLd("name"),
                            description: SalesforceInteractions.resolvers.fromSelector(
                                ".short-description",
                                (desc) => desc.trim(),
                            ),
                            url: SalesforceInteractions.resolvers.fromHref(),
                            imageUrl: SalesforceInteractions.resolvers.fromSelectorAttribute(
                                ".product-carousel .carousel-item[data-slick-index='0'] img",
                                "src",
                                (url) => window.location.origin + url,
                            ),
                            inventoryCount: 1,
                            price: SalesforceInteractions.resolvers.fromSelector(
                                ".prices .price .value",
                                (price) => parseFloat(price.replace(/[^0-9\.]+/g, "")),
                            ),
                            rating: () => {
                                return SalesforceInteractions.mcis.extractFirstGroup(
                                    /([.\w]+) out of/,
                                    SalesforceInteractions.cashDom(".ratings .sr-only").text(),
                                );
                            },
                        },
                        relatedCatalogObjects: {
                            Category: SalesforceInteractions.DisplayUtils.pageElementLoaded(
                                ".container .product-breadcrumb .breadcrumb a",
                                "html",
                            ).then((ele) => {
                                return SalesforceInteractions.resolvers.buildCategoryId(
                                    ".container .product-breadcrumb .breadcrumb a",
                                    null,
                                    null,
                                    (categoryId) => [categoryId.toUpperCase()],
                                );
                            }),
                            Gender: SalesforceInteractions.DisplayUtils.pageElementLoaded(
                                ".product-breadcrumb .breadcrumb a, h1.product-name",
                                "html",
                            ).then((ele) => {
                                if (
                                    SalesforceInteractions.cashDom(".product-breadcrumb .breadcrumb a")
                                        .first()
                                        .text()
                                        .toLowerCase() === "women" ||
                                    SalesforceInteractions.cashDom("h1.product-name").text().indexOf("Women") >= 0
                                ) {
                                    return ["WOMEN"];
                                } else if (
                                    SalesforceInteractions.cashDom(".product-breadcrumb .breadcrumb a")
                                        .first()
                                        .text()
                                        .toLowerCase() === "men" ||
                                    SalesforceInteractions.cashDom("h1.product-name").text().indexOf("Men") >= 0
                                ) {
                                    return ["MEN"];
                                } else {
                                    return;
                                }
                            }),
                            Color: SalesforceInteractions.DisplayUtils.pageElementLoaded(
                                ".attributes",
                                "html",
                            ).then((ele) => {
                                return SalesforceInteractions.resolvers.fromSelectorAttributeMultiple(
                                    ".color-value",
                                    "data-attr-value",
                                );
                            }),
                            Feature: SalesforceInteractions.DisplayUtils.pageElementLoaded(
                                ".features",
                                "html",
                            ).then((ele) => {
                                return SalesforceInteractions.resolvers.fromSelectorMultiple(
                                    ".long-description li",
                                    (features) => {
                                        return features.map((feature) => {
                                            return feature.trim().toUpperCase();
                                        });
                                    },
                                );
                            }),
                        },
                    },
                },
                contentZones: [
                    {
                        name: "product_detail_recs_row_1",
                        selector: ".row.recommendations div[id*='cq']:nth-of-type(1)",
                    },
                    {
                        name: "product_detail_recs_row_2",
                        selector: ".row.recommendations div[id*='cq']:nth-of-type(2)",
                    },
                    { name: "testHeader", selector: ".site-header" },
                ],
                listeners: [
                    SalesforceInteractions.listener("click", ".add-to-cart", () => {
                        let lineItem = SalesforceInteractions.mcis.buildLineItemFromPageState(
                            "select.quantity-select option:checked",
                        );
                        SalesforceInteractions.sendEvent({
                            interaction: {
                                name: SalesforceInteractions.CartInteractionName.AddToCart,
                                lineItem: lineItem,
                            },
                        });
                    }),
 
                    //custom
                    SalesforceInteractions.listener("click", ".far fa-question-circle fa-lg mr-1", () => {
                        let lineItem = SalesforceInteractions.mcis.buildLineItemFromPageState(
                            "select.quantity-select option:checked",
                        );
                        SalesforceInteractions.sendEvent({
                            interaction: {
                                name: { name: "help request" },
                            },
                        });
                    }),
                    //add to whishlist magic
                    //
                    SalesforceInteractions.listener("click", ".add-to-wish-list", (event) => {
                        const productName = window.dataLayer[2].ecommerce.detail.products[0].name;
                        SalesforceInteractions.sendEvent({
                            interaction: {
                                name: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObjectDetail,
                                catalogObject: {
                                    type: "Product",
                                    id: SalesforceInteractions.getSitemapResult().currentPage.interaction
                                        .catalogObject.id,
                                    attributes: {
                                        sku: {
                                            id: SalesforceInteractions.cashDom(".product-detail[data-pid]").attr(
                                                "data-pid",
                                            ),
                                        },
                                    },
                                    relatedCatalogObjects: {
                                        Color: [
                                            SalesforceInteractions.cashDom(".color-value.selected").attr(
                                                "data-attr-value",
                                            ),
                                        ],
                                    },
                                },
                            },
                        })
                        SalesforceInteractions.sendEvent({
                            interaction: { name: "Added to wish list" },
                            user: { identities: { lastFavoriteProduct: productName } },
                        });
                    }),
                ],
            },*/
        ],
    };
    const getProductsFromDataLayer = () => {
        if (window.dataLayer) {
            for (let i = 0; i < window.dataLayer.length; i++) {
                if (
                    ((window.dataLayer[i].ecommerce && window.dataLayer[i].ecommerce.detail) || {}).products
                ) {
                    return window.dataLayer[i].ecommerce.detail.products;
                }
            }
        }
    };
    SalesforceInteractions.initSitemap(sitemapConfig);
});