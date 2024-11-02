import './commitDialog.css';
import { ipcRenderer } from 'electron';

// Correctly type the button as HTMLElement
const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;

// Add event listener to the button
confirmBtn.addEventListener('click', () => {
    // Call the API function when the button is clicked
    window.dialogAPI.clickedConfirmCommit();
    confirmBtn.style.display = 'block';

});
