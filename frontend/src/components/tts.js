const express = require('express');
const fs = require('fs');
const util = require('util');
const textToSpeech = require('@google-cloud/text-to-speech');

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: 'path_to_your_service_account.json'
});

const router = express.Router();

router.post('/tts', async (req, res) => {
  const { text, language } = req.body;

  const request = {
    input: { text },
    voice: { languageCode: language || 'en-US', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    const audioBase64 = response.audioContent.toString('base64');
    res.json({ audio: audioBase64 });
  } catch (err) {
    console.error(err);
    res.status(500).send('TTS Error');
  }
});

module.exports = router;
