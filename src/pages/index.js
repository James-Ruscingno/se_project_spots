import "./index.css";
import { enableValidation, settings, resetValidation, toggleButtonState } from "../scripts/validation.js";
import Api from "../utils/api.js";

import logoImageSrc from "../images/logo.svg";
import avatarImageSrc from "../images/avatar.jpg";
import editIconSrc from "../images/edit.svg";
import plusIconSrc from "../images/plus.svg";
import pencilIconSrc from "../images/pencil-light.svg";



document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logo-image").src = logoImageSrc;
  document.getElementById("avatar-image").src = avatarImageSrc;
  document.getElementById("edit-icon").src = editIconSrc;
  document.getElementById("plus-icon").src = plusIconSrc;
  document.querySelector(".profile__pencil-icon").src = pencilIconSrc;

  const cardTemplate = document
    .querySelector("#card-template")
    .content.querySelector(".card");
  const cardsList = document.querySelector(".cards__list");

  const editProfileBtn = document.querySelector(".profile__edit-btn");
  const editProfileModal = document.querySelector("#edit-profile-modal");
  const avatarModalBtn = document.querySelector(".profile__avatar-btn");

  const editProfileForm = editProfileModal.querySelector(".modal__form");
  const editProfileNameInput = editProfileModal.querySelector("#profile-name-input");
  const editProfileDescriptionInput = editProfileModal.querySelector("#profile-description-input");

  const newPostBtn = document.querySelector(".profile__add-btn");
  const newPostModal = document.querySelector("#new-post-modal");
  const cardSubmitBtn = newPostModal.querySelector(".modal__submit-btn");
  const newPostForm = newPostModal.querySelector(".modal__form");
  const newPostNameInput = document.querySelector("#card-description-input");
  const newPostLinkInput = document.querySelector("#card-image-input");

  const avatarModal = document.querySelector("#edit-avatar-modal");
  const avatarForm = avatarModal.querySelector(".modal__form");
  const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
  const avatarInput = document.querySelector("#profile-avatar-input");

  const profileNameEl = document.querySelector(".profile__name");
  const profileDescriptionEl = document.querySelector(".profile__description");

  const deleteModal = document.querySelector("#delete-modal");
  const deleteForm = deleteModal.querySelector(".delete-modal__form");

  const previewModal = document.querySelector("#preview-modal");
  const previewImageEl = previewModal.querySelector(".modal__image");
  const previewNameEl = previewModal.querySelector(".modal__caption");

  let selectedCard, selectedCardId;
  let currentUserId = null;

  const api = new Api({
    baseUrl: "https://around-api.en.tripleten-services.com/v1",
    headers: {
      authorization: "1fc52dd2-f3bc-40bc-bd6a-00b5a601a658",
      "Content-Type": "application/json",
    },
  });

  api.getAppInfo()
    .then(([cards, userData]) => {
      const { name, about, avatar, _id } = userData;
      currentUserId = _id;
      cards.forEach((item) => {
        const cardElement = getCardElement(item, currentUserId);
        cardsList.append(cardElement);
      });
      profileNameEl.textContent = name;
      profileDescriptionEl.textContent = about;
      document.getElementById("avatar-image").src = avatar;
    })
    .catch(console.error);

  const openModal = (modal) => {
    modal.classList.add("modal_is-opened");
    document.addEventListener("keydown", handleEscClose);
  };

  const closeModal = (modal) => {
    modal.classList.remove("modal_is-opened");
    document.removeEventListener("keydown", handleEscClose);
  };

  const handleEscClose = (evt) => {
    if (evt.key === "Escape") {
      const openedModal = document.querySelector(".modal.modal_is-opened");
      if (openedModal) closeModal(openedModal);
    }
  };

  function handleDeleteSubmit(evt) {
    evt.preventDefault();

    const submitBtn = evt.submitter;
    submitBtn.textContent = "Deleting...";

    api.deleteCard(selectedCardId)
      .then(() => {
        selectedCard.remove();
        closeModal(deleteModal);
      })
      .catch(console.error)
      .finally(() => {
      submitBtn.textContent = "Delete";
      });
  }

function handleLike(evt, cardId) {
  const likeButton = evt.target;
  const isLiked = likeButton.classList.contains("card__like-button_active");

  api.handleLike(cardId, isLiked)
    .then(() => {
      likeButton.classList.toggle("card__like-button_active");
    })
    .catch((err) => {
      console.error("Failed to update like:", err);
    });
}

  function getCardElement(data, currentUserId) {
    const cardElement = cardTemplate.cloneNode(true);
    const cardTitleEl = cardElement.querySelector(".card__title");
    const cardImageEl = cardElement.querySelector(".card__image");
    const cardDeleteBtnEl = cardElement.querySelector(".card__delete-button");
    const cardLikeBtnEl = cardElement.querySelector(".card__like-button");

   const isLikedByCurrentUser = Array.isArray(data.likes) && data.likes.some((user) => user._id === currentUserId);
  if (isLikedByCurrentUser) {
    cardLikeBtnEl.classList.add("card__like-button_active");
  }


    cardImageEl.src = data.link;
    cardImageEl.alt = data.name;
    cardTitleEl.textContent = data.name;

    cardLikeBtnEl.addEventListener("click", (evt) => handleLike(evt, data._id));

    cardDeleteBtnEl.addEventListener("click", () => {
      selectedCard = cardElement;
      selectedCardId = data._id;
      openModal(deleteModal);
    });

    cardImageEl.addEventListener("click", () => {
      previewImageEl.src = data.link;
      previewImageEl.alt = data.name;
      previewNameEl.textContent = data.name;
      openModal(previewModal);
    });

    return cardElement;
  }

  editProfileBtn.addEventListener("click", () => {
    editProfileNameInput.value = profileNameEl.textContent;
    editProfileDescriptionInput.value = profileDescriptionEl.textContent;
    resetValidation(editProfileForm, settings);
    openModal(editProfileModal);
  });

  newPostBtn.addEventListener("click", () => openModal(newPostModal));
  avatarModalBtn.addEventListener("click", () => openModal(avatarModal));
  avatarForm.addEventListener("submit", handleAvatarSubmit);

  const deleteCancelBtn = deleteModal.querySelector(".delete-modal__cancel-btn");

if (deleteCancelBtn) {
  deleteCancelBtn.addEventListener("click", () => {
    closeModal(deleteModal);
  });
}

  function handleAvatarSubmit(evt) {
    evt.preventDefault();

    const submitBtn = evt.submitter;
    submitBtn.textContent = "Saving...";

    const newAvatar = avatarInput.value;

    api.editAvatarInfo(newAvatar)
      .then((data) => {
        document.getElementById("avatar-image").src = data.avatar;
        closeModal(avatarModal);
        avatarForm.reset();
        const inputList = Array.from(avatarForm.querySelectorAll(settings.inputSelector));
        toggleButtonState(inputList, avatarSubmitBtn, settings);
        resetValidation(avatarForm, settings);
      })
      .catch(console.error)
      .finally(() => {
      submitBtn.textContent = "Save";
      });
  }

  editProfileForm.addEventListener("submit", function handleEditProfileSubmit(evt) {
    evt.preventDefault();

    const submitBtn = evt.submitter;
    submitBtn.textContent = "Saving...";

    api.editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
      .then((data) => {
        profileNameEl.textContent = data.name;
        profileDescriptionEl.textContent = data.about;
        closeModal(editProfileModal);
        })
      .catch(console.error)
      .finally(() => {
      submitBtn.textContent = "Save";
      });
  });

  newPostForm.addEventListener("submit", function handleNewPostSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
    submitBtn.textContent = "Saving...";

  const inputValues = {
    name: newPostNameInput.value,
    link: newPostLinkInput.value,
  };

  api.addCard(inputValues)
    .then((createdCard) => {
      const cardElement = getCardElement(createdCard, currentUserId);
      cardsList.prepend(cardElement);
      newPostForm.reset();
      const inputList = Array.from(newPostForm.querySelectorAll(settings.inputSelector));
      toggleButtonState(inputList, cardSubmitBtn, settings);
      resetValidation(newPostForm, settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = "Save";
      });
});

  deleteForm.addEventListener("submit", handleDeleteSubmit);

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("mousedown", (evt) => {
      if (evt.target === modal) closeModal(modal);
    });

    const closeButton = modal.querySelector(".modal__close-btn");
    if (closeButton) {
      closeButton.addEventListener("click", () => closeModal(modal));
    }
  });

  enableValidation(settings);
});