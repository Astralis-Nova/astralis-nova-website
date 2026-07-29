const ARCHIVE_ROOT = "https://web.archive.org/web/20190804224335id_/http://www.angelfire.com/az2/soldierboy602/music/";

const ALLOWED_FILES = new Set([
  "taboo.mid", "locomotn.mid", "macarena.mid", "makuswet.mid", "likewind.mid",
  "myheart.mid", "rockwithu.mid", "savethebest.mid", "windbeneathmywings.mid", "cherish.mid",
  "Massac1.mid", "mygirl.mid", "onlyyou.mid", "smokegetsinyoureyes.mid", "whendovescry.mid",
  "wonderfulworld.mid", "heartofglass.mid", "Heyyou.mid", "houseoftherisingsun.mid", "imagine.mid",
  "Jump2.mid", "hardday.mid", "erasurechains.mid", "erasurealways.mid", "dance.mid",
  "Comfnumb.mid", "Beegees.mid", "alive.mid", "Hardt1.mid", "allthatshewants.mid",
  "babyIloveyourway.mid", "bodyguard.mid", "evita.mid", "invisibletouch.mid", "losingmyreligion.mid",
  "nowomannocry.mid", "redredwine.mid", "thewayitis.mid", "wheredoyougo.mid", "littleredcorvette.mid",
  "diamondsandpearls.mid", "1999.mid", "begirl.mid", "dreamingofu.mid", "iwoulddieforu.mid",
  "fernando.mid", "labamba.mid", "godavida.mid", "wlkdntrn.mid", "illmake1.mid",
  "powerlv.mid", "princeletsgocrazy2.mid", "thashiznit.mid", "thacrossroads.mid", "themostbeautifulgirlintheworld.mid"
]);

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function isMidi(bytes) {
  return bytes.length >= 4 &&
    bytes[0] === 0x4d &&
    bytes[1] === 0x54 &&
    bytes[2] === 0x68 &&
    bytes[3] === 0x64;
}

export async function onRequestGet({ request }) {
  const requestUrl = new URL(request.url);
  const file = requestUrl.searchParams.get("file") || "";

  if (!ALLOWED_FILES.has(file)) {
    return json({ error: "Unknown MIDI file." }, 404);
  }

  const archiveUrl = `${ARCHIVE_ROOT}${encodeURIComponent(file)}`;

  try {
    const upstream = await fetch(archiveUrl, {
      redirect: "follow",
      headers: {
        "accept": "audio/midi, audio/x-midi, application/octet-stream;q=0.9, */*;q=0.5",
        "user-agent": "Astralis-Nova-First-Orbit-MIDI-Restoration/1.0"
      },
      cf: {
        cacheEverything: true,
        cacheTtl: 86400
      }
    });

    if (!upstream.ok) {
      return json({ error: `Archive returned ${upstream.status}.` }, 502);
    }

    const body = await upstream.arrayBuffer();
    const bytes = new Uint8Array(body);

    if (!isMidi(bytes)) {
      return json({ error: "The archived response was not a valid MIDI file." }, 502);
    }

    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "audio/midi",
        "content-disposition": `inline; filename="${file}"`,
        "cache-control": "public, max-age=86400, s-maxage=604800, immutable",
        "access-control-allow-origin": "*",
        "x-content-type-options": "nosniff"
      }
    });
  } catch (error) {
    console.error("MIDI archive proxy failed", file, error);
    return json({ error: "The archived MIDI could not be fetched." }, 502);
  }
}
