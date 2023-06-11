// script.js
let selectedImages = {};

function selectImage(characterId, imageUrl) {
  selectedImages[characterId] = imageUrl;
  document
    .querySelectorAll(`img`)
    .forEach(img => img.classList.remove('selected'));
  document.querySelector(`img[src='${imageUrl}']`).classList.add('selected');
}

async function updateCharacter(characterId) {
  const chosenImageUrl = selectedImages[characterId];
  if (!chosenImageUrl) {
    alert('You must select an image');
    return;
  }

  const response = await fetch(`/characters/${characterId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chosenImageUrl,
      readyToMint: true,
    }),
  });

  if (!response.ok) {
    alert('Failed to update character');
  } else {
    location.reload();
  }
}
