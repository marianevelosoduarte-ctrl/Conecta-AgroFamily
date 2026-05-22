import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiAuth } from "@/lib/api-auth";

/* ————————————————————————————————————————————
   Clima via Open-Meteo (gratuito, sem chave de API).
   1) Pega lat/lon da propriedade; se não tiver, geocodifica o município.
   2) Busca clima atual + previsão de 5 dias.
   ———————————————————————————————————————————— */

export async function GET() {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const prop = await prisma.propriedade.findUnique({
    where: { id: propriedadeId },
    select: { municipio: true, uf: true, latitude: true, longitude: true },
  });
  if (!prop) {
    return NextResponse.json({ error: "Propriedade não encontrada" }, { status: 404 });
  }

  let { latitude, longitude } = prop;

  // Geocoding do município (uma vez; salva pra próxima)
  if (latitude == null || longitude == null) {
    if (!prop.municipio) {
      return NextResponse.json(
        { error: "Cadastre o município da sua propriedade em Ajustes para ver o clima." },
        { status: 400 }
      );
    }
    try {
      const q = encodeURIComponent(prop.municipio);
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&country=BR&language=pt`
      );
      const geo = await geoRes.json();
      const hit = geo?.results?.[0];
      if (!hit) {
        return NextResponse.json(
          { error: "Não encontramos esse município. Verifique o nome em Ajustes." },
          { status: 404 }
        );
      }
      latitude = hit.latitude;
      longitude = hit.longitude;
      await prisma.propriedade.update({
        where: { id: propriedadeId },
        data: { latitude, longitude },
      });
    } catch (e) {
      console.error("Erro no geocoding:", e);
      return NextResponse.json({ error: "Erro ao localizar o município" }, { status: 500 });
    }
  }

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=auto&forecast_days=5`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    const data = await res.json();

    const dias = (data.daily?.time || []).map((t: string, i: number) => ({
      data: t,
      code: data.daily.weather_code[i],
      max: Math.round(data.daily.temperature_2m_max[i]),
      min: Math.round(data.daily.temperature_2m_min[i]),
      chuva: data.daily.precipitation_probability_max?.[i] ?? null,
    }));

    return NextResponse.json({
      local: `${prop.municipio || "Sua região"}${prop.uf ? " - " + prop.uf : ""}`,
      atual: {
        temperatura: Math.round(data.current?.temperature_2m ?? 0),
        umidade: data.current?.relative_humidity_2m ?? null,
        vento: Math.round(data.current?.wind_speed_10m ?? 0),
        chuva: data.current?.precipitation ?? 0,
        code: data.current?.weather_code ?? 0,
      },
      dias,
    });
  } catch (e) {
    console.error("Erro ao buscar clima:", e);
    return NextResponse.json({ error: "Erro ao buscar o clima" }, { status: 500 });
  }
}
