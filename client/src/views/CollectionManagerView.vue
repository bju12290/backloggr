
<template>
    <div class="fixed top-16 w-72">
      <Combobox v-model="query">
        <div class="relative mt-1">
          <div
            class="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
          >
            <ComboboxInput
              class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              :displayValue="(person) => person.name"
              @change="query = $event.target.value; searchGames();"
            />
            <ComboboxButton
              class="absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <ChevronUpDownIcon
                class="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </ComboboxButton>
          </div>
          <TransitionRoot
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ComboboxOptions
              class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
            >
              <!-- <div
                v-if="filteredPeople.length === 0 && query !== ''"
                class="relative cursor-default select-none py-2 px-4 text-gray-700"
              >
                Nothing found.
              </div> -->
  
              <ComboboxOption
                    v-for="game in searchResults"
                    as="template"
                    :key="game.id"
                    :value="game"
                    v-slot="{ selected, active }"
                    >
                    <li
                        class="relative cursor-default select-none py-2 pl-10 pr-4"
                        :class="{
                        'bg-teal-600 text-white': active,
                        'text-gray-900': !active,
                        }"
                    >
                        <span
                        class="block truncate"
                        :class="{ 'font-medium': selected, 'font-normal': !selected }"
                        >
                        {{ game.name }}
                        </span>
                        <span
                        v-if="selected"
                        class="absolute inset-y-0 left-0 flex items-center pl-3"
                        :class="{ 'text-white': active, 'text-teal-600': !active }"
                        >
                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                        </span>
                    </li>
                    </ComboboxOption>
            </ComboboxOptions>
          </TransitionRoot>
        </div>
      </Combobox>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import {
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
    TransitionRoot,
  } from '@headlessui/vue'
  import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

  let searchResults = ref([])

  const people = [
    { id: 1, name: 'Wade Cooper' },
    { id: 2, name: 'Arlene Mccoy' },
    { id: 3, name: 'Devon Webb' },
    { id: 4, name: 'Tom Cook' },
    { id: 5, name: 'Tanya Fox' },
    { id: 6, name: 'Hellen Schmidt' },
  ]

  let query = ref('')
  console.log(query.value)

  
  const searchGames = () => {
  // Make a request to the Firebase Function with the user's query (query.value)
  fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGameData?query=${query.value}`)
    .then((response) => response.json())
    .then((data) => {
      // Update the search results with the response from the server
      searchResults.value = data
        console.log(searchResults.value)
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};
  </script>