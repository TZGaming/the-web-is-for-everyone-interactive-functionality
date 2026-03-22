import express from 'express'
import { Liquid } from 'liquidjs';


// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({ extended: true }))

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

// Snapmaps
app.get('/', async function (request, response) {

  response.redirect('/groups')
})

// Groups
const groupsResponse = await fetch('https://fdnd-agency.directus.app/items/snappthis_group?fields=name,uuid,users,snappmap.snappthis_snapmap_uuid.*')
const groupsJSON = await groupsResponse.json()

app.get('/groups', async function (request, response) {

  response.render('groups.liquid', { groups: groupsJSON.data })
})

app.get('/groups/:uuid', async function (request, response) {
  const groupUuid = request.params.uuid

  const url = `https://fdnd-agency.directus.app/items/snappthis_group?filter[uuid][_eq]=${groupUuid}&fields=name,uuid,snappmap.snappthis_snapmap_uuid.*`
  
  const groupResponse = await fetch(url)
  const groupJSON = await groupResponse.json()

  const groupData = groupJSON.data[0]

  response.render('group-detail.liquid', { group: groupData })
})


// Snapmaps
app.get('/snappmaps', async function (request, response) {

  response.render('snappmaps.liquid', { groups: groupsJSON.data })
})

app.get('/snappmaps/:uuid', async function (request, response) {
  // 1. Haal de snappmap op
  const snappmapResponse = await fetch('https://fdnd-agency.directus.app/items/snappthis_snapmap?fields=*.*.*.*&filter[uuid][_eq]=' + request.params.uuid);
  const snappmapJSON = await snappmapResponse.json();
  
  // Controleer of de data array bestaat en gevuld is
  const snappmap = (snappmapJSON.data && snappmapJSON.data.length > 0) ? snappmapJSON.data[0] : null;

  // 2. Zoek de groep (beveiligd tegen null-pointer errors)
  const parentGroup = groupsJSON.data.find(group => 
    group.snappmap && group.snappmap.some(s => 
      s.snappthis_snapmap_uuid && s.snappthis_snapmap_uuid.uuid === request.params.uuid
    )
  );

  // 3. Render: Geef 'snappmap' en 'groupName' expliciet mee
  response.render('snappmap.liquid', { 
    snapmap: snappmap,
    groupName: parentGroup ? parentGroup.name : 'Geen groep gevonden',
    snappmaps: snappmap ? [snappmap] : [] // Geef een lege lijst mee als snappmap null is
  });
});



// Snapps
app.get('/snapps/:location', async function (request, response) {

  const snappsResponse = await fetch('https://fdnd-agency.directus.app/items/snappthis_snap?fields=*.*&filter[location][_eq]=' + request.params.location)
  const snappsJSON = await snappsResponse.json()


  response.render('snappmap.liquid', { snapps: snappsJSON.data })
})

app.get('/snapps/snappmap/:uuid', async function (request, response) {
  const url = `https://fdnd-agency.directus.app/items/snappthis_snap?fields=*.*,actions.action&filter[uuid][_eq]=${request.params.uuid}`;
  const snappResponse = await fetch(url);
  const snappJSON = await snappResponse.json();
  const snapp = (snappJSON.data && snappJSON.data.length > 0) ? snappJSON.data[0] : null;

  if (!snapp) return response.status(404).send("Snap niet gevonden");

  let snappmap = null;
  const snapmapId = typeof snapp.snapmap === 'object' ? snapp.snapmap.uuid : snapp.snapmap;

  if (snapmapId) {
      const snappmapResponse = await fetch(`https://fdnd-agency.directus.app/items/snappthis_snapmap?fields=*.*.*.*&filter[uuid][_eq]=${snapmapId}`);
      const snappmapJSON = await snappmapResponse.json();
      
      if (snappmapJSON.data && Array.isArray(snappmapJSON.data) && snappmapJSON.data.length > 0) {
          snappmap = snappmapJSON.data[0];
      }
  }

  const parentGroup = groupsJSON.data.find(group => 
    group.snappmap && group.snappmap.some(s => 
      s.snappthis_snapmap_uuid && s.snappthis_snapmap_uuid.uuid === snapmapId
    )
  );

  // 4. Render
  response.render('snapp.liquid', { 
    snapp: snapp,
    snapmap: snappmap,
    groupName: parentGroup ? parentGroup.name : 'Geen groep gevonden',
    groups: groupsJSON.data
  });
});


// Upload snapps
app.post("/snappmaps/:uuid", upload.single("file"), async (req, res) => {

  // Step 1: Upload file to Directus

  // Get the uploaded file from the form in HTML
  const file = req.file;

  // Create a new FormData object to send file data in a multipart/form-data request
  const formData = new FormData()
  const blob = new Blob([file.buffer], { type: file.mimetype })
  formData.append("file", blob, file.originalname)

  // Send a POST request to Directus API to upload the file
  const uploadResponse = await fetch("https://fdnd-agency.directus.app/files", {
    method: "POST",
    body: formData,
  })

  // Parse the JSON response from Directus
  const uploadResponseData = await uploadResponse.json();

  // Extract the file ID from the response (Directus returns "id", not "uuid")
  const imageId = uploadResponseData?.data?.id;

  // If no file ID is returned, the upload failed → send error response
  if (!imageId) {
    return res.send("Upload failed: No file ID returned");
  }

  // Step 2: Create new item in Directus

  // Get snappmap uuid from route parameters
  const snappmapuuid = req.params.uuid

  // Create an object representing the new item to store in Directus
  const newSnap = {
    location: "Amsterdam Zuidoost",
    snapmap: snappmapuuid,
    author: "ae56c4e4-e0a6-4e99-9790-88ecf9db9138",
    picture: imageId,
  };

  // Send a POST request to create a new item in Directus
  const snapResponse = await fetch("https://fdnd-agency.directus.app/items/snappthis_snap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newSnap),
  });

  // Parse the JSON response from Directus
  const snapData = await snapResponse.json();

  // If new item creation failed → send error response
  if (!snapResponse.ok) {
    return res.redirect(303, `/snappmaps/?status=error`)
  }

  // If new item creation worked → Success response
    res.redirect(303, `/snappmaps/?status=success`)
})

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})