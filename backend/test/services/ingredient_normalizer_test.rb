require "test_helper"

class IngredientNormalizerTest < ActiveSupport::TestCase
  test "strips quantity, units, and whitespace" do
    assert_equal "egg", IngredientNormalizer.call("1 egg")
    assert_equal "all-purpose flour", IngredientNormalizer.call("1 cup all-purpose flour")
    assert_equal "vanilla extract", IngredientNormalizer.call("½ teaspoon  vanilla extract ")
    assert_equal "dark chocolate", IngredientNormalizer.call("3.5 ounces dark chocolate")
    assert_equal "milk", IngredientNormalizer.call("1 ½ cups milk")
    assert_equal "peanut butter", IngredientNormalizer.call("1/4 cup peanut butter")
  end

  test "removes duplicate words and singularizes" do
    assert_equal "egg", IngredientNormalizer.call("eggs eggs")
    assert_equal "flour", IngredientNormalizer.call("flour flour")
  end

  test "singularizes each word and keeps comma tails" do
    assert_equal "radish trimmed", IngredientNormalizer.call("1 bunch radishes, trimmed")
    assert_equal "radish", IngredientNormalizer.call("radishes")
    assert_equal "radish", IngredientNormalizer.call("radish")
    assert_equal "medium banana sliced", IngredientNormalizer.call("medium bananas, sliced")
  end

  test "returns an empty string for blank input" do
    assert_equal "", IngredientNormalizer.call("")
    assert_equal "", IngredientNormalizer.call(nil)
  end
end
