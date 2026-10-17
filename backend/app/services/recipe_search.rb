class RecipeSearch
  # Given a list of pantry items, return ranked recipes paginated as { results:, total: }.
  #
  # Ranking:
  #  1. Fully doable recipes first (missing_count == 0)
  #  2. Then most matching recipe ingredients
  #  3. Among partial matches, fewest missing ingredients
  #  4. Then higher rating
  #
  # For example: user inputs "eggs, milk, flour" => Results:
  #  Two-Ingredient Naan — matches: 2, missing: 0
  #  Eggs on the Grill — matches: 1, missing: 0
  #  Alison's Gluten-Free Bread — matches: 8, missing: 6 # most matches out of missing>0
  #  Chinese Cocktail Buns — matches: 6, missing: 5
  #  Doggie Biscuits II — matches: 6, missing: 6
  Result = Struct.new(:recipe, :match_count, :missing_count, :missing_ingredients, keyword_init: true)

  def self.call(pantry, limit: nil, offset: 0)
    new(pantry).call(limit: limit, offset: offset)
  end

  def initialize(pantry)
    @pantry = Array(pantry)
      .map { |name| IngredientNormalizer.call(name) }
      .compact_blank
      .uniq
  end

  def self.matches?(pantry_name, recipe_name)
    pantry = pantry_name.to_s.downcase.strip
    recipe = recipe_name.to_s.downcase.strip
    return true if pantry == recipe
    recipe.match?(/\b#{Regexp.escape(pantry)}\b/i)
  end

  def covers?(recipe_name)
    ingredient_satisfied?(recipe_name)
  end

  def call(limit: nil, offset: 0)
    return { results: [], total: 0 } if @pantry.empty?

    like_sql = @pantry.map { "ingredients.name ILIKE ?" }.join(" OR ")
    like_args = @pantry.map { |p| "%#{ActiveRecord::Base.sanitize_sql_like(p)}%" }

    recipe_ids = Recipe
      .joins(:ingredients)
      .where(like_sql, *like_args)
      .distinct
      .pluck(:id)

    recipes = Recipe
      .where(id: recipe_ids)
      .includes(:ingredients)

    results = recipes.filter_map do |recipe|
      names = recipe.ingredients.map(&:name)
      matched = names.select { |name| ingredient_satisfied?(name) }
      missing = names.reject { |name| ingredient_satisfied?(name) }
      # The ILIKE prefilter also finds substrings ("egg" in "eggplant"), so drop recipes with no whole-word match
      next if matched.empty?

      Result.new(
        recipe: recipe,
        match_count: matched.size,
        missing_count: missing.size,
        missing_ingredients: missing
      )
    end

    ranked = results.sort_by do |r|
      [
        r.missing_count == 0 ? 0 : 1,
        -r.match_count,
        r.missing_count,
        -r.recipe.ratings.to_f
      ]
    end

    total = ranked.size
    page = limit ? ranked.drop(offset).first(limit) : ranked

    { results: page, total: total }
  end

  private

  def ingredient_satisfied?(recipe_name)
    @pantry.any? { |p| self.class.matches?(p, recipe_name) }
  end
end
