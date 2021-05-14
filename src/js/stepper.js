/* eslint-disable no-undef */
import Stepper from 'bs-stepper';

document.addEventListener('DOMContentLoaded', () => {
  const stepper = new Stepper(document.querySelector('.bs-stepper'));
  const bsNextSteppers = document.querySelectorAll('.bs-stepper-next');
  const bsPreviousSteppers = document.querySelectorAll('.bs-stepper-previous');

  // Next step event listeners
  bsNextSteppers.forEach((nextStep) => nextStep.addEventListener('click', () => stepper.next()));

  // Previous step event listeners
  bsPreviousSteppers.forEach((previousStep) => previousStep.addEventListener('click', () => stepper.previous()));
});
