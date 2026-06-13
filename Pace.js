netlify/functions/pace.js
// netlify/functions/pace.js
// Proxy sicuro tra ASCENT e OpenAI.
// La chiave API non Ã¨ mai nel codice: viene letta dalla
// variabile d'ambiente OPENAI_API_KEY configurata su Netlify.

exports.handler = async function (event) {

  // Accetta solo POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Leggi la chiave dalle variabili d'ambiente di Netlify
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Chiave API non configurata. Aggiungi OPENAI_API_KEY nelle variabili d'ambiente di Netlify.",
      }),
    };
  }

  // Parsing del body inviato da ASCENT
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Body non valido" }),
    };
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Campo 'messages' mancante o non valido" }),
    };
  }

  // Chiamata a OpenAI
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 600,
        messages: messages,
      }),
    });

    const data = await response.json();

    // Restituisce la risposta di OpenAI al browser
    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Errore di rete verso OpenAI: " + err.message }),
    };
  }
};
