window.cookieManager.on('UserPreferencesLoaded', (preferences) => {
    var dataLayer = window.dataLayer || [];
    dataLayer.push({'event': 'Cookie Preferences', 'cookiePreferences': preferences});
});

window.cookieManager.on('UserPreferencesSaved', (preferences) => {
    var dataLayer = window.dataLayer || [];
    var dtrum = window.dtrum;

    dataLayer.push({'event': 'Cookie Preferences', 'cookiePreferences': preferences});

    if(dtrum !== undefined) {
        if(preferences.apm === 'on') {
            dtrum.enable();
            dtrum.enableSessionReplay();
        } else {
            dtrum.disableSessionReplay();
            dtrum.disable();
        }
    }
});

var config = {
    userPreferences: {
        cookieName: 'cookies_policy',
    },
    cookieManifest: [
        {
            categoryName: 'analytics',
            cookies: [
                '_ga',
                '_gid',
                '_gat_UA-'
            ]
        },
        {
            categoryName: 'apm',
            cookies: [
                'dtCookie',
                'dtLatC',
                'dtPC',
                'dtSa',
                'rxVisitor',
                'rxvt'
            ]
        }
    ]
};

window.cookieManager.init(config);