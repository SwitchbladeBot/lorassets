<h1>lorassets <img src="https://github.com/SwitchbladeBot/lorassets/workflows/CI/badge.svg"></h1>
Automatically built and well organized Legends of Runeterra data and asset bundles. This was made because it was very difficult to pull this data from the LoR Data Dragon, as it is currently served in a bunch of separate ZIP files.

## Table of Contents
- [Table of Contents](#table-of-contents)
- [TO-DOs](#to-dos)
- [Endpoints](#endpoints)
  - [`GET` /metadata.json](#get-metadatajson)
  - [`GET` /:locale/data/cards.json](#get-localedatacardsjson)
  - [`GET` /:locale/data/globals.json](#get-localedataglobalsjson)
  - [`GET` /:locale/img/cards/:image](#get-localeimgcardsimage)
  - [`GET` /:locale/img/regions/:image](#get-localeimgregionsimage)
- [Notice](#notice)

## TO-DOs

*Pull requests are welcome!*

- [ ] Find a way to automatically detect new sets, instead of listing them in `sets.json`
- [ ] Replace pvp.net asset URLs in card entries with our URLs

## Endpoints

### `GET` /metadata.json

Information about which locales and sets are available

**Example** [`https://lorassets.switchblade.xyz/metadata.json`](https://lorassets.switchblade.xyz/metadata.json)

```json
{
    "locales": [
        "en_us",
        "ko_kr",
        "fr_fr",
        "es_es",
        "de_de",
        "it_it",
        "es_mx",
        "pt_br",
        "tr_tr",
        "ru_ru",
        "ja_jp",
        "zh_tw"
    ],
    "sets": [
        "1",
        "2"
    ]
}
```

### `GET` /:locale/data/cards.json

All Legends of Runeterra cards as of the latest set

**Example** [`https://lorassets.switchblade.xyz/en_us/data/cards.json`](https://lorassets.switchblade.xyz/en_us/data/cards.json)

```json
[
    {
        "associatedCards": [],
        "associatedCardRefs": [],
        "assets": [
            {
                "gameAbsolutePath": "http://dd.b.pvp.net/1_1_0/set1/en_us/img/cards/01IO012T2.png",
                "fullAbsolutePath": "http://dd.b.pvp.net/1_1_0/set1/en_us/img/cards/01IO012T2-full.png"
            }
        ],
        "region": "Ionia",
        "regionRef": "Ionia",
        "attack": 0,
        "cost": 3,
        "health": 0,
        "description": "Give an ally +0|+3 this round.",
        "descriptionRaw": "Give an ally +0|+3 this round.",
        "levelupDescription": "",
        "levelupDescriptionRaw": "",
        "flavorText": "",
        "artistName": "SIXMOREVODKA",
        "name": "Discipline of Fortitude",
        "cardCode": "01IO012T2",
        "keywords": [
            "Burst"
        ],
        "keywordRefs": [
            "Burst"
        ],
        "spellSpeed": "Burst",
        "spellSpeedRef": "Burst",
        "rarity": "None",
        "rarityRef": "None",
        "subtype": "",
        "subtypes": [],
        "supertype": "",
        "type": "Spell",
        "collectible": false
    },
    ...
]
```

### `GET` /:locale/data/globals.json

> The global.json file contains sets of values that are reused throughout various cards. This includes keywords, rarities, regions (otherwise known as factions), spell speeds, and card types. There are two fields are paired with each other; `name` and `nameRef`. The `name` field will return a localized value, while the `nameRef` field will return a reference value that remains consistent across every locale.
> 
> [**(Riot Developer Portal)**](https://developer.riotgames.com/docs/lor#data-dragon_set-bundles)

**Example** [`https://lorassets.switchblade.xyz/en_us/data/globals.json`](https://lorassets.switchblade.xyz/en_us/data/globals.json)

```json
{
  "keywords": [
    {
      "name": "Frostbite", // localized
      "nameRef": "Frostbite",
      ...
    },
    ...
  ],
  "rarities": [...],
  "regions": [...],
  "spellSpeeds": [...],
  "types": [...]
}
```

### `GET` /:locale/img/cards/:image

> Each card in the full set bundle has at least two image files:
> - The card render (e.g., 01DE001.png) is an image of the full card including its stats and text and frame, in the relevant locale. These images are 768x1024 pixels.
> - The card illustration (e.g., 01DE001-full.png) is the full card art, without stats or text or a card frame. These images are 1024x1024 pixels for spells, and 2048x1024 pixels for all other cards.
> 
> In some cases, cards may have an alternative version of card art available in addition:
> - The card alt render (e.g., 01DE001-alt.png) is an image of the full card as described above, but with the alternative art.
> - The card alt illustration (e.g., 01DE001-alt-full.png) is the full card art as described above, but with the alternative art.
> 
> [**(Riot Developer Portal)**](https://developer.riotgames.com/docs/lor#data-dragon_core-bundles)

**Example** [`https://lorassets.switchblade.xyz/en_us/img/cards/01FR009.png`](https://lorassets.switchblade.xyz/en_us/img/cards/01FR009.png)

![Braum](https://lorassets.switchblade.xyz/en_us/img/cards/01FR009.png)

### `GET` /:locale/img/regions/:image

Images for each region in the game

**Example** [`https://lorassets.switchblade.xyz/en_us/img/regions/icon-bilgewater.png`](https://lorassets.switchblade.xyz/en_us/img/regions/icon-bilgewater.png)

![Bilgewater](https://lorassets.switchblade.xyz/en_us/img/regions/icon-bilgewater.png)

## Notice

- Switchblade isn`t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends™ and Riot Games are trademarks or registered trademarks of Riot Games, Inc.

- All assets and data that the code in this repository downloads and compiles are owned by Riot Games, Inc.
