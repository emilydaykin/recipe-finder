class Api::RecipesController < ApplicationController
  DEFAULT_LIMIT = 10
  MAX_LIMIT = 50

  def index
    limit = parsed_limit
    offset = parsed_offset
    pantry = parsed_pantry

    if pantry.empty?
      recipes = Recipe
        .includes(recipe_ingredients: :ingredient)
        .order(shuffled_order)
        .limit(limit)
        .offset(offset)

      render json: {
        recipes: recipes.map { |recipe| serialize_browse_result(recipe) },
        total: Recipe.count
      }
    else
      search = RecipeSearch.call(pantry, limit: limit, offset: offset)

      render json: {
        recipes: search[:results].map { |result| serialize_search_result(result) },
        total: search[:total]
      }
    end
  end

  def show
    recipe = Recipe.includes(recipe_ingredients: :ingredient).find(params[:id])
    render json: serialize_recipe(recipe, pantry: parsed_pantry)
  end

  private

  def parsed_limit
    [ [ params.fetch(:limit, DEFAULT_LIMIT).to_i, 1 ].max, MAX_LIMIT ].min
  end

  def parsed_offset
    [ params.fetch(:offset, 0).to_i, 0 ].max
  end

  def parsed_pantry
    params[:ingredients].to_s.split(",").map(&:strip).reject(&:blank?)
  end

  # The same seed always gives the same order, so paging with one seed never repeats a recipe
  def shuffled_order
    seed = params[:seed].presence || SecureRandom.hex(8)
    Arel.sql(Recipe.sanitize_sql_array([ "md5(recipes.id::text || ?), recipes.id", seed.to_s ]))
  end

  def serialize_browse_result(recipe)
    {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      cook_time: recipe.cook_time,
      prep_time: recipe.prep_time,
      ratings: recipe.ratings,
      ingredients: serialize_ingredients(recipe)
    }
  end

  def serialize_search_result(result)
    recipe = result.recipe
    {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      cook_time: recipe.cook_time,
      prep_time: recipe.prep_time,
      ratings: recipe.ratings,
      match_count: result.match_count,
      missing_count: result.missing_count,
      missing_ingredients: result.missing_ingredients
    }
  end

  def serialize_recipe(recipe, pantry: [])
    {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      cook_time: recipe.cook_time,
      prep_time: recipe.prep_time,
      ratings: recipe.ratings,
      ingredients: serialize_ingredients(recipe, pantry: pantry)
    }
  end

  def serialize_ingredients(recipe, pantry: [])
    matcher = RecipeSearch.new(pantry)

    recipe.recipe_ingredients.map do |ri|
      {
        raw_text: ri.raw_text,
        name: ri.ingredient.name,
        matched: matcher.covers?(ri.ingredient.name)
      }
    end
  end
end
