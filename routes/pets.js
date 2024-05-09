const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const authController = require('../controllers/authController');


router.post('/', petController.createNewPet);
router.get('/:id', authController.protect,petController.getPetData);
router.delete('/:id', petController.deletePet);
router.patch('/:id', petController.updatePetData);

module.exports = router;
