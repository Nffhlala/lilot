const PROXY = "https://api.codetabs.com/v1/proxy/?quest=";

const Extensions = {
    mangadex: {
        name: "MangaDex",
        search: async (q) => {
            const res = await fetch(`https://api.mangadex.org/manga?title=${q}&limit=12&includes[]=cover_art`);
            const data = await res.json();
            return data.data.map(m => {
                const cover = m.relationships.find(r => r.type === 'cover_art');
                return {
                    id: m.id,
                    title: m.attributes.title.en || Object.values(m.attributes.title)[0],
                    cover: cover ? `https://uploads.mangadex.org/covers/${m.id}/${cover.attributes.fileName}.256.jpg` : "",
                    source: 'mangadex'
                };
            });
        }
    },
    asura: {
        name: "Asura Scans",
        search: async (q) => {
            const url = `https://asuracomic.net/?s=${q}`;
            const res = await fetch(PROXY + encodeURIComponent(url));
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, "text/html");
            return Array.from(doc.querySelectorAll('.bs')).map(item => ({
                id: item.querySelector('a').href,
                title: item.querySelector('.tt').innerText.trim(),
                cover: item.querySelector('img').src,
                source: 'asura'
            }));
        }
    }
};