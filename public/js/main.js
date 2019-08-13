$(() => {
  if ($("textarea#ta").length) {
    CKEDITOR.replace("ta");
  }

  $("a.confirmDeletion").on("click", () => {
    if (!confirm("confirm deletion")) {
      return false;
    }
  });
});

$(".alert")
  .fadeTo(2000, 500)
  .fadeOut(500, function() {
    $(".alert").fadeOut(500);
  });
