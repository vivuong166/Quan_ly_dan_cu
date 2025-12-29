// Entry animation for login card
document.addEventListener('DOMContentLoaded', function() {
	setTimeout(function() {
		var card = document.getElementById('loginCard');
		if (card) {
			card.classList.add('show');
		}
	}, 100);
});
