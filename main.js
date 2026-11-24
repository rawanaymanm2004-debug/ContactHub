var form = document.getElementById("contactForm");
var fullName = document.getElementById("fullName");
var phoneNumber = document.getElementById("phoneNumber");
var emailAddress = document.getElementById("emailAddress");
var contactList = document.getElementById("contactList");
var emptyState = document.getElementById("emptyState");
var address = document.getElementById("Address");
var group = document.getElementById("group");
var notes = document.getElementById("Notes");
var isFav = document.getElementById("isFav");
var isEmg = document.getElementById("isEmg");
var searchInput = document.getElementById("searchInput");
var favItems = document.getElementById("favItems");
var emgItems = document.getElementById("emgItems");
var totalCount = document.getElementById("totalCount");
var favCount = document.getElementById("favCount");
var emgCount = document.getElementById("emgCount");
var contactsText = document.getElementById("contactsText");
var modalEl = document.getElementById("staticBackdrop");
var modalTitle = document.getElementById("staticBackdropLabel");
var photoInput = document.getElementById("photoInput");
var photoPreview = document.getElementById("photoPreview");
var changePhotoBtn = document.getElementById("changePhotoBtn");

var contacts = JSON.parse(localStorage.getItem("contacts")) || [];
var editId = null;
var currentPhoto = "";

function saveData() {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

// ---------- Photo ----------
function showPreview() {
  if (currentPhoto !== "") {
    photoPreview.innerHTML = `<img src="${currentPhoto}" class="w-100 h-100 object-fit-cover" alt="contact photo" />`;
  } else {
    photoPreview.innerHTML = `<i class="fa-solid fa-user fa-2xl" style="color: white"></i>`;
  }
}

changePhotoBtn.addEventListener("click", function () {
  photoInput.click();
});

photoInput.addEventListener("change", function () {
  var file = photoInput.files[0];
  if (!file) {
    return;
  }
  if (!file.type.startsWith("image/")) {
    Swal.fire("Error", "Please choose an image file", "error");
    return;
  }

  if (file.size > 300 * 1024) {
    Swal.fire("Error", "Image must be smaller than 300KB", "error");
    photoInput.value = "";
    return;
  }
  var reader = new FileReader();
  reader.onload = function () {
    currentPhoto = reader.result;
    showPreview();
  };
  reader.readAsDataURL(file);
});

function getInitials(name) {
  var words = name.split(" ");
  var first = words[0].charAt(0);
  var second = words[1] ? words[1].charAt(0) : "";
  return (first + second).toUpperCase();
}

// ---------- Validation ----------
function validate(name, phone, email) {
  if (name === "") {
    Swal.fire("Error", "Please enter the full name", "error");
    return false;
  }
  if (name.length < 3) {
    Swal.fire("Error", "Name must be at least 3 characters", "error");
    return false;
  }

  var phoneRegex = /^01[0125][0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    Swal.fire("Error", "Enter a valid phone number like 01012345678", "error");
    return false;
  }

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email !== "" && !emailRegex.test(email)) {
    Swal.fire("Error", "Enter a valid email address", "error");
    return false;
  }

  for (var i = 0; i < contacts.length; i++) {
    if (contacts[i].phone === phone && contacts[i].id !== editId) {
      Swal.fire("Error", "This phone number already exists", "error");
      return false;
    }
  }
  return true;
}

// ---------- Render ----------
function render() {
  var term = searchInput.value.trim().toLowerCase();

  var filtered = contacts.filter(function (c) {
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  var favs = contacts.filter(function (c) {
    return c.fav;
  });
  var emgs = contacts.filter(function (c) {
    return c.emg;
  });

  totalCount.innerHTML = contacts.length;
  favCount.innerHTML = favs.length;
  emgCount.innerHTML = emgs.length;
  contactsText.innerHTML = contacts.length + " ";

  emptyState.classList.toggle("d-none", filtered.length > 0);

  contactList.innerHTML = filtered
    .map(function (c) {
      return `
    <div class="col-12 col-md-6">
      <div class="contact-card bg-white rounded-4 shadow-sm overflow-hidden">
        <div class="p-3">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="avatar-box position-relative rounded-4 d-flex align-items-center justify-content-center text-white fw-bold">
              ${c.photo ? `<img src="${c.photo}" class="w-100 h-100 object-fit-cover rounded-4" alt="${c.name}" />` : getInitials(c.name)}
              ${c.fav ? `<span class="avatar-badge badge-fav position-absolute rounded-circle d-flex align-items-center justify-content-center"><i class="fa-solid fa-star"></i></span>` : ""}
              ${c.emg ? `<span class="avatar-badge badge-emg position-absolute rounded-circle d-flex align-items-center justify-content-center"><i class="fa-solid fa-heart-pulse"></i></span>` : ""}
            </div>
            <div>
              <h3 class="fs-5 fw-semibold text-black m-0 mb-2">${c.name}</h3>
              <div class="d-flex align-items-center gap-2 text-secondary">
                <span class="info-icon phone rounded-2 d-flex align-items-center justify-content-center">
                  <i class="fa-solid fa-phone"></i>
                </span>
                ${c.phone}
              </div>
            </div>
          </div>

          ${
            c.email
              ? `
          <div class="d-flex align-items-center gap-2 text-secondary mb-2">
            <span class="info-icon mail rounded-2 d-flex align-items-center justify-content-center">
              <i class="fa-solid fa-envelope"></i>
            </span>
            ${c.email}
          </div>`
              : ""
          }

          ${
            c.address
              ? `
          <div class="d-flex align-items-center gap-2 text-secondary mb-3">
            <span class="info-icon map rounded-2 d-flex align-items-center justify-content-center">
              <i class="fa-solid fa-location-dot"></i>
            </span>
            ${c.address}
          </div>`
              : ""
          }

          <div class="d-flex gap-2">
            ${c.group ? `<span class="tag tag-group rounded-2 px-2 py-1 text-capitalize">${c.group}</span>` : ""}
            ${c.emg ? `<span class="tag tag-emg rounded-2 px-2 py-1"><i class="fa-solid fa-heart-pulse"></i> Emergency</span>` : ""}
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center p-3 border-top">
          <div class="d-flex gap-2">
            <a href="tel:${c.phone}" class="action-btn call rounded-3 d-flex align-items-center justify-content-center"><i class="fa-solid fa-phone"></i></a>
            ${c.email ? `<a href="mailto:${c.email}" class="action-btn mail rounded-3 d-flex align-items-center justify-content-center"><i class="fa-solid fa-envelope"></i></a>` : ""}
          </div>
          <div class="d-flex gap-2">
            <button onclick="toggleFav(${c.id})" class="action-btn fav rounded-3 border-0 ${c.fav ? "active" : ""}"><i class="fa-solid fa-star"></i></button>
            <button onclick="toggleEmg(${c.id})" class="action-btn emg rounded-3 border-0 ${c.emg ? "active" : ""}"><i class="fa-solid fa-heart-pulse"></i></button>
            <button onclick="editContact(${c.id})" class="action-btn edit rounded-3 border-0"><i class="fa-solid fa-pen"></i></button>
            <button onclick="deleteContact(${c.id})" class="action-btn del rounded-3 border-0"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    </div>`;
    })
    .join("");

  if (favs.length === 0) {
    favItems.innerHTML = `<p class="py-5 fw-semibold">No favorites yet</p>`;
  } else {
    favItems.innerHTML = favs
      .map(function (c) {
        return sideItem(c);
      })
      .join("");
  }

  if (emgs.length === 0) {
    emgItems.innerHTML = `<p class="py-5 fw-semibold">No emergency contacts</p>`;
  } else {
    emgItems.innerHTML = emgs
      .map(function (c) {
        return sideItem(c);
      })
      .join("");
  }
}

function sideItem(c) {
  return `
    <div class="d-flex align-items-center justify-content-between p-2 text-start">
      <div>
        <p class="m-0 fw-semibold text-black">${c.name}</p>
        <small class="text-secondary">${c.phone}</small>
      </div>
      <a href="tel:${c.phone}"><i class="fa-solid fa-phone"></i></a>
    </div>`;
}

// ---------- Add & Update ----------
form.addEventListener("submit", function (e) {
  e.preventDefault();

  var name = fullName.value.trim();
  var phone = phoneNumber.value.trim();
  var email = emailAddress.value.trim();

  if (validate(name, phone, email) === false) {
    return;
  }

  if (editId === null) {
    // Add
    var contact = {
      id: Date.now(),
      name: name,
      phone: phone,
      email: email,
      address: address.value.trim(),
      group: group.value,
      notes: notes.value.trim(),
      photo: currentPhoto,
      fav: isFav.checked,
      emg: isEmg.checked,
    };
    contacts.push(contact);
    Swal.fire({
      icon: "success",
      title: "Added!",
      text: "Contact added successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  } else {
    // Update
    for (var i = 0; i < contacts.length; i++) {
      if (contacts[i].id === editId) {
        contacts[i].name = name;
        contacts[i].phone = phone;
        contacts[i].email = email;
        contacts[i].address = address.value.trim();
        contacts[i].group = group.value;
        contacts[i].notes = notes.value.trim();
        contacts[i].photo = currentPhoto;
        contacts[i].fav = isFav.checked;
        contacts[i].emg = isEmg.checked;
      }
    }
    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: "Contact updated successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  }

  saveData();
  render();
  bootstrap.Modal.getOrCreateInstance(modalEl).hide();
});

// ---------- Edit ----------
function editContact(id) {
  for (var i = 0; i < contacts.length; i++) {
    if (contacts[i].id === id) {
      editId = id;
      modalTitle.innerHTML = "Edit Contact";
      fullName.value = contacts[i].name;
      phoneNumber.value = contacts[i].phone;
      emailAddress.value = contacts[i].email;
      address.value = contacts[i].address;
      group.value = contacts[i].group;
      notes.value = contacts[i].notes;
      isFav.checked = contacts[i].fav;
      isEmg.checked = contacts[i].emg;
      currentPhoto = contacts[i].photo || "";
      showPreview();
    }
  }
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

// ---------- Delete ----------
function deleteContact(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this contact?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete it",
  }).then(function (result) {
    if (result.isConfirmed) {
      contacts = contacts.filter(function (c) {
        return c.id !== id;
      });
      saveData();
      render();
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  });
}

// ---------- Favorite & Emergency ----------
function toggleFav(id) {
  for (var i = 0; i < contacts.length; i++) {
    if (contacts[i].id === id) {
      contacts[i].fav = !contacts[i].fav;
    }
  }
  saveData();
  render();
}

function toggleEmg(id) {
  for (var i = 0; i < contacts.length; i++) {
    if (contacts[i].id === id) {
      contacts[i].emg = !contacts[i].emg;
    }
  }
  saveData();
  render();
}

// ---------- Search ----------
searchInput.addEventListener("input", render);

modalEl.addEventListener("hidden.bs.modal", function () {
  form.reset();
  editId = null;
  currentPhoto = "";
  photoInput.value = "";
  showPreview();
  modalTitle.innerHTML = "Add New Contact";
});

render();
