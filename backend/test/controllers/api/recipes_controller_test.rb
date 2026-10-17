require "test_helper"

class Api::RecipesControllerTest < ActionDispatch::IntegrationTest
  test "show marks 'bananas' input as matching a banana recipe line" do
    recipe = Recipe.create!(title: "Peanut Butter Banana Ice Cream", ratings: 4.9)
    banana = Ingredient.create!(
      name: IngredientNormalizer.call("4 ripe bananas, cut into 1-inch slices")
    )
    peanut_butter = Ingredient.create!(
      name: IngredientNormalizer.call("1/4 cup peanut butter")
    )
    RecipeIngredient.create!(
      recipe: recipe,
      ingredient: banana,
      raw_text: "4 ripe bananas, cut into 1-inch slices"
    )
    RecipeIngredient.create!(
      recipe: recipe,
      ingredient: peanut_butter,
      raw_text: "¼ cup peanut butter"
    )
    flour = Ingredient.create!(name: IngredientNormalizer.call("all-purpose flour"))
    RecipeIngredient.create!(
      recipe: recipe,
      ingredient: flour,
      raw_text: "2 cups all-purpose flour"
    )

    get api_recipe_path(recipe), params: { ingredients: "butter,strawberry,bananas" }

    assert_response :success
    ingredients = JSON.parse(response.body).fetch("ingredients")
    bananas = ingredients.find { |item| item["raw_text"].include?("bananas") }
    peanut = ingredients.find { |item| item["raw_text"].include?("peanut butter") }
    flour_line = ingredients.find { |item| item["raw_text"].include?("flour") }

    assert_equal true, bananas["matched"]
    assert_equal true, peanut["matched"]
    assert_equal false, flour_line["matched"]
  end

  test "show does not match a pantry item that only appears inside another word" do
    recipe = Recipe.create!(title: "Salted Butter Toast", ratings: 4.0)
    butter = Ingredient.create!(name: IngredientNormalizer.call("salted butter"))
    RecipeIngredient.create!(
      recipe: recipe,
      ingredient: butter,
      raw_text: "2 tablespoons salted butter"
    )

    get api_recipe_path(recipe), params: { ingredients: "salt" }

    assert_response :success
    ingredient = JSON.parse(response.body).fetch("ingredients").sole
    assert_equal false, ingredient["matched"]
  end

  test "show, without ingredients, marks no ingredients as matched" do
    get api_recipe_path(recipes(:pancakes))

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal "Pancakes", body["title"]
    assert_equal 3, body["ingredients"].size
    assert body["ingredients"].none? { |item| item["matched"] }
  end

  test "show, with input ingredients, marks the ones you have as matched and the rest as not" do
    get api_recipe_path(recipes(:crepes)), params: { ingredients: "egg,flour" }

    assert_response :success
    matched = JSON.parse(response.body)["ingredients"]
      .to_h { |item| [ item["name"], item["matched"] ] }

    assert_equal(
      { "egg" => true, "flour" => true, "milk" => false, "sugar" => false, "butter" => false },
      matched
    )
  end

  test "show returns 404 for an unknown recipe" do
    get api_recipe_path(id: 0)

    assert_response :not_found
  end

  test "index without ingredients browses all recipes with their ingredient lists" do
    get api_recipes_path

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal Recipe.count, body["total"]
    assert_equal Recipe.count, body["recipes"].size
    body["recipes"].each do |recipe|
      assert recipe.key?("ingredients")
      refute recipe.key?("match_count")
    end
  end

  test "index without ingredients pages through one shuffle without repeats for the same seed" do
    get api_recipes_path, params: { seed: "abc", limit: 3, offset: 0 }
    first_page = JSON.parse(response.body)["recipes"].map { |recipe| recipe["id"] }

    get api_recipes_path, params: { seed: "abc", limit: 3, offset: 3 }
    second_page = JSON.parse(response.body)["recipes"].map { |recipe| recipe["id"] }

    assert_equal Recipe.pluck(:id).sort, (first_page + second_page).sort
  end

  test "index without ingredients returns the same order for the same seed" do
    get api_recipes_path, params: { seed: "abc" }
    first = JSON.parse(response.body)["recipes"].map { |recipe| recipe["id"] }

    get api_recipes_path, params: { seed: "abc" }
    second = JSON.parse(response.body)["recipes"].map { |recipe| recipe["id"] }

    assert_equal first, second
  end

  test "index with ingredients returns nothing when nothing matches" do
    get api_recipes_path, params: { ingredients: "zzzqqq" }

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal [], body["recipes"]
    assert_equal 0, body["total"]
  end

  test "index with ingredients returns ranked matches with match details" do
    get api_recipes_path, params: { ingredients: "egg,flour,milk" }

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 4, body["total"]
    assert_equal [ "Pancakes", "Fried Egg", "Boiled Egg", "Crepes" ],
      body["recipes"].map { |recipe| recipe["title"] }

    crepes = body["recipes"].last
    assert_equal 3, crepes["match_count"]
    assert_equal 2, crepes["missing_count"]
    assert_equal %w[butter sugar], crepes["missing_ingredients"].sort
    refute crepes.key?("ingredients")
  end

  test "index ignores blank ingredients in the list" do
    get api_recipes_path, params: { ingredients: "egg, ,milk" }
    with_blank = JSON.parse(response.body)

    get api_recipes_path, params: { ingredients: "egg,milk" }

    assert_equal JSON.parse(response.body), with_blank
  end

  test "index paginates with limit and offset" do
    get api_recipes_path, params: { ingredients: "egg,flour,milk", limit: 2, offset: 1 }

    body = JSON.parse(response.body)
    assert_equal [ "Fried Egg", "Boiled Egg" ], body["recipes"].map { |recipe| recipe["title"] }
    assert_equal 4, body["total"]
  end

  test "index clamps limit between 1 and 50 and offset to at least 0" do
    Recipe.insert_all(Array.new(51) { |i| { title: "Extra #{i}" } })

    get api_recipes_path, params: { limit: 0 }
    assert_equal 1, JSON.parse(response.body)["recipes"].size

    get api_recipes_path, params: { limit: 999 }
    assert_equal 50, JSON.parse(response.body)["recipes"].size

    get api_recipes_path, params: { ingredients: "egg,flour,milk", limit: 1, offset: -5 }
    assert_equal [ "Pancakes" ], JSON.parse(response.body)["recipes"].map { |recipe| recipe["title"] }
  end
end
