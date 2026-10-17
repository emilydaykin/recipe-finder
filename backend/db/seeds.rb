path = Rails.root.join("db/data/recipes-en.json")
recipes_data = JSON.parse(File.read(path))

RecipeIngredient.delete_all
Ingredient.delete_all
Recipe.delete_all

puts "🌱 Seeding #{recipes_data.size} recipes..."

recipes_data.each_with_index do |data, index|
  recipe = Recipe.create!(
    title: data["title"],
    cook_time: data["cook_time"],
    prep_time: data["prep_time"],
    ratings: data["ratings"],
    image: data["image"]
  )

  data["ingredients"].each do |raw_text|
    name = IngredientNormalizer.call(raw_text)
    next if name.blank?

    ingredient = Ingredient.find_or_create_by!(name: name)

    RecipeIngredient.find_or_create_by!(recipe: recipe, ingredient: ingredient) do |ri|
      ri.raw_text = raw_text
    end
  end

  puts "  #{index + 1}/#{recipes_data.size} — #{recipe.title}"
end

puts "✅ Done. Recipes: #{Recipe.count}, Ingredients: #{Ingredient.count}, Join rows: #{RecipeIngredient.count}"