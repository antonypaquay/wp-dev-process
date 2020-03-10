const showTheName = () => {
  alert("Javascript is running");
};

window.onload = () => {
  showTheName();
  console.log("You are ready to code!");
};

const btn = document.getElementsByTagName("button");

btn[0].addEventListener("click", () => {
  confirm("Clicked!");
});
