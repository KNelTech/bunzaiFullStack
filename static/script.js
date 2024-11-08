// Fetch cat image when page loads
document.addEventListener("DOMContentLoaded", fetchNewCat);

// Get new cat image
async function fetchNewCat() {
  try {
    const res = await fetch("https://api.thecatapi.com/v1/images/search");
    const data = await res.json();
    document.getElementById("catImage").src = data[0].url;
  } catch (err) {
    console.error(err);
  }
}

// Handle form submit
const form = document.getElementById("ratingForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    name: form.name.value,
    rating: form.rating.value,
    comment: form.comment.value,
  };

  try {
    await fetch("/myform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    form.reset();
    fetchNewCat();
  } catch (err) {
    console.error(err);
  }
});
