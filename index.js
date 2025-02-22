import express from 'express';
import cytube from 'cytube-client';
import cors from 'cors';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

const app = express();
app.use(cors());

const port = 3001;

const mainClient = await cytube.connect('marecon');
let mainMedia = '';

mainClient.on('changeMedia', (data) => {
  if (data.type === 'fi') {
    const tempFilePath = 'thumbnail.jpg';

    ffmpeg(data.id)
      .on('end', () => {
        fs.readFile(tempFilePath, (err, imgdata) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to read thumbnail' });
          }
          const base64Image = `data:image/jpeg;base64,${imgdata.toString(
            'base64'
          )}`;

          // Cleanup temp file
          fs.unlinkSync(tempFilePath);

          mainMedia = { ...data, img: base64Image };
        });
      })
      .on('error', (err) => {
        console.error(err);
      })
      .screenshots({
        timestamps: ['5%'], // Capture frame at 5% of video duration
        filename: tempFilePath,
        folder: './',
        size: '800x600',
      });
    return;
  }
  mainMedia = { ...data };
});

app.get('/', async (req, res) => {
  res.send(mainMedia);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
