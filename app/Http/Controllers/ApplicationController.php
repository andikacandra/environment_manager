<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;
use App\Http\Requests\StoreEnvVariableRequest;
use App\Http\Requests\UpdateEnvVariableRequest;
use App\Models\AccessKey;
use App\Models\EnvType;
use App\Models\EnvValue;
use App\Models\EnvValueChange;
use App\Models\EnvVariable;
use App\Models\Group;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;

class ApplicationController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $this->authorize('view-any-applications');

        $isSuperAdmin = $user->roles->contains(function ($role) {
            return strtolower($role->name) === 'super-admin';
        });
        if ($isSuperAdmin) {
            $applications = Application::with(['group', 'envVariables', 'accessKeys'])->get();
        } else {
            $userGroupIds = $user->groupMembers->pluck('group.id')->toArray();
            $applications = Application::with(['group', 'envVariables', 'accessKeys'])
                ->whereIn('group_id', $userGroupIds)
                ->get();
        }

        $enhancedApplications = $applications->map(function ($application) use ($user, $isSuperAdmin) {
            if ($isSuperAdmin) {
                $application->userCanView = true;
                $application->userCanEdit = true;
                $application->userCanDelete = true;
            } else {
                $appSlug = $application->slug;
                $application->userCanView = $user->can('view-application-' . $appSlug);
                $application->userCanEdit = $user->can('edit-application-' . $appSlug);
                $application->userCanDelete = $user->can('delete-application-' . $appSlug);
            }

            return $application;
        });
        return Inertia::render('Dashboard/Applications/Index', [
            'applications' => $enhancedApplications,
            'canCreateApplication' => $user->can('create-applications'),
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create-applications');
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $isSuperAdmin = $user->roles->contains(function ($role) {
            return strtolower($role->name) === 'super-admin';
        });
        if ($isSuperAdmin) {
            $groups = Group::all();
        } else {
            $groupIds = $user->groupMembers()
                ->where('role', 'admin')
                ->pluck('group_id')
                ->toArray();
            $groups = Group::whereIn('id', $groupIds)->get();
        }

        return Inertia::render('Dashboard/Applications/Create', [
            'groups' => $groups,
        ]);
    }


    public function store(StoreApplicationRequest $request)
    {
        $validatedData = $request->validated();
        try {
            DB::beginTransaction();
            $validatedData['slug'] = str($validatedData['name'])->slug()->toString();

            $application = Application::create([
                'name' => $validatedData['name'],
                'description' => $validatedData['description'] ?? null,
                'slug' => $validatedData['slug'],
                'group_id' => $validatedData['group_id'],
            ]);
            $envTypes = EnvType::all();
            foreach ($envTypes as $envType) {
                AccessKey::create([
                    'application_id' => $application->id,
                    'env_type_id' => $envType->id,
                    'key' => str()->random(32),
                ]);
            }
            $group = Group::findOrFail($validatedData['group_id']);
            $appSlug = $application->slug;

            $viewApplication = 'view-application-' . $appSlug;
            $editApplication = 'edit-application-' . $appSlug;
            $deleteApplication = 'delete-application-' . $appSlug;
            $createEnvVariablePermission = 'create-env-variables-' . $appSlug;
            $editEnvVariablePermission = 'edit-env-variables-' . $appSlug;
            $deleteEnvVariablePermission = 'delete-env-variables-' . $appSlug;

            $this->createPermissionIfNotExists($viewApplication);
            $this->createPermissionIfNotExists($editApplication);
            $this->createPermissionIfNotExists($deleteApplication);
            $this->createPermissionIfNotExists($createEnvVariablePermission);
            $this->createPermissionIfNotExists($editEnvVariablePermission);
            $this->createPermissionIfNotExists($deleteEnvVariablePermission);

            foreach ($group->groupMembers as $groupMember) {
                $user = $groupMember->user;
                $user->givePermissionTo($viewApplication);
                $user->givePermissionTo($createEnvVariablePermission);
                $user->givePermissionTo($editEnvVariablePermission);
                $user->givePermissionTo($deleteEnvVariablePermission);
                if ($groupMember->role === 'admin') {
                    $user->givePermissionTo($editApplication);
                    $user->givePermissionTo($deleteApplication);
                }
            }

            DB::commit();
            return redirect()
                ->route('applications.index')
                ->with('success', 'Application created successfully with access keys for all environment types!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create application: ' . $e->getMessage(), [
                'request' => $request->all(),
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()
                ->back()
                ->with('error', 'Failed to create application: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Application $application)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->can('view-applications') && !$user->can('view-application-' . $application->slug)) {
            return Redirect::route('applications.index')->with('error', 'You do not have permission to view this application.');
        }

        $application->load([
            'group',
            'envVariables' => function ($query) {
                $query->orderBy('sequence', 'asc')->orderBy('name', 'asc');
            },
            'envVariables.envValues.accessKey',
            'envVariables.envValues.accessKey.envType',
            'accessKeys.envType',
        ]);

        $canCreateEnvVariables = $user->can('create-env-variables')  ||
            $user->can('create-env-variables', $application->slug);
        $canEditEnvVariables = $user->can('edit-env-variables')  ||
            $user->can('edit-env-variables', $application->slug);
        $canDeleteEnvVariables = $user->can('delete-env-variables')  ||
            $user->can('delete-env-variables', $application->slug);
        $canEditEnvValues = $user->can('edit-env-values')  ||
            $user->can('edit-env-values', $application->slug);
        $canViewDevelopment = $user->can('view-development');
        $canEditDevelopment = $user->can('edit-development');
        $canViewStaging = $user->can('view-staging');
        $canEditStaging = $user->can('edit-staging');
        $canViewProduction = $user->can('view-production');
        $canEditProduction = $user->can('edit-production');

        $envTypes = $application->accessKeys->pluck('envType')->unique('id')->values();

        if (!$user->tokens()->where('name', 'env-manager-' . $application->id)->exists()) {
            $token = $user->createToken('env-manager-' . $application->id)->plainTextToken;
        } else {
            $token = $user->tokens()->where('name', 'env-manager-' . $application->id)->first()->plainTextToken;
        }
        return Inertia::render('Dashboard/Applications/Show', [
            'application' => $application,
            'envTypes' => $envTypes,
            'canCreateEnvVariables' => $canCreateEnvVariables,
            'canEditEnvVariables' => $canEditEnvVariables,
            'canDeleteEnvVariables' => $canDeleteEnvVariables,
            'canEditEnvValues' => $canEditEnvValues,
            'canViewDevelopment' => $canViewDevelopment,
            'canEditDevelopment' => $canEditDevelopment,
            'canViewStaging' => $canViewStaging,
            'canEditStaging' => $canEditStaging,
            'canViewProduction' => $canViewProduction,
            'canEditProduction' => $canEditProduction,

        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Application $application)
    {
        //
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->can('edit-applications') && !$user->can('edit-application-' . $application->slug)) {
            return Redirect::route('applications.index')->with('error', 'You do not have permission to edit this application.');
        }
        $groups = Group::all();
        $application->load(['group']);

        return Inertia::render('Dashboard/Applications/Edit', [
            'application' => $application,
            'groups' => $groups,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateApplicationRequest $request, Application $application)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $validatedData = $request->validated();
        $oldSlug = $application->slug;
        $oldGroupId = $application->group_id;
        $newGroupId = $validatedData['group_id'];
        $nameChanged = $validatedData['name'] !== $application->name;

        try {
            DB::beginTransaction();
            $newSlug = str($validatedData['name'])->slug()->toString();
            $validatedData['slug'] = $newSlug;
            $application->update($validatedData);
            if ($nameChanged) {
                $permissionMap = [
                    'view-application-' . $oldSlug => 'view-application-' . $newSlug,
                    'edit-application-' . $oldSlug => 'edit-application-' . $newSlug,
                    'delete-application-' . $oldSlug => 'delete-application-' . $newSlug,
                    'create-env-variables-' . $oldSlug => 'create-env-variables-' . $newSlug,
                    'edit-env-variables-' . $oldSlug => 'edit-env-variables-' . $newSlug,
                    'delete-env-variables-' . $oldSlug => 'delete-env-variables-' . $newSlug,
                    'create-development-' . $oldSlug => 'create-development-' . $newSlug,
                    'create-staging-' . $oldSlug => 'create-staging-' . $newSlug,
                    'create-production-' . $oldSlug => 'create-production-' . $newSlug,
                    'edit-env-values-' . $oldSlug => 'edit-env-values-' . $newSlug,
                ];
                foreach ($permissionMap as $oldPermName => $newPermName) {
                    $this->createPermissionIfNotExists($newPermName);
                }
                foreach ($permissionMap as $oldPermName => $newPermName) {
                    $oldPermission = \Spatie\Permission\Models\Permission::where('name', $oldPermName)->first();
                    if ($oldPermission) {
                        $usersWithPermission = $oldPermission->users;
                        foreach ($usersWithPermission as $user) {
                            $user->givePermissionTo($newPermName);
                            $user->revokePermissionTo($oldPermName);
                        }
                    }
                }
            }
            if ($oldGroupId != $newGroupId) {
                $oldGroup = Group::findOrFail($oldGroupId);
                $newGroup = Group::findOrFail($newGroupId);
                $permissionSuffixes = [
                    'view-application-',
                    'edit-application-',
                    'delete-application-',
                    'create-env-variables-',
                    'edit-env-variables-',
                    'delete-env-variables-',
                    'create-development-',
                    'create-staging-',
                    'create-production-',
                    'edit-env-values-',
                ];
                foreach ($oldGroup->groupMembers as $groupMember) {
                    $oldUser = $groupMember->user;
                    foreach ($permissionSuffixes as $suffix) {
                        $permissionName = $suffix . $newSlug;
                        if ($oldUser->hasPermissionTo($permissionName)) {
                            $oldUser->revokePermissionTo($permissionName);
                        }
                    }
                }
                foreach ($newGroup->groupMembers as $groupMember) {
                    $newUser = $groupMember->user;
                    $newUser->givePermissionTo('view-application-' . $newSlug);
                    $newUser->givePermissionTo('create-env-variables-' . $newSlug);
                    $newUser->givePermissionTo('edit-env-variables-' . $newSlug);
                    $newUser->givePermissionTo('delete-env-variables-' . $newSlug);
                    $newUser->givePermissionTo('edit-env-values-' . $newSlug);
                    if ($groupMember->role === 'admin') {
                        $newUser->givePermissionTo('edit-application-' . $newSlug);
                        $newUser->givePermissionTo('delete-application-' . $newSlug);
                    }
                    $newUser->givePermissionTo('create-development-' . $newSlug);
                    $newUser->givePermissionTo('create-staging-' . $newSlug);
                    $newUser->givePermissionTo('create-production-' . $newSlug);
                }
            }

            DB::commit();
            return redirect()->route('applications.index')->with('success', 'Application updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update application: ' . $e->getMessage(), [
                'request' => $request->all(),
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Failed to update application: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Application $application)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->can('delete-applications') && !$user->can('delete-application-' . $application->slug)) {
            return redirect()->back()->with('error', 'You do not have permission to delete this application.');
        }

        try {
            DB::beginTransaction();
            if ($application->health > 0) {
                return redirect()->back()->with(
                    'error',
                    'Cannot delete application because it contains filled environment variables. ' .
                        'Current health: ' . $application->health . '/' . $application->health .
                        '. Please empty all environment variable values before deleting.'
                );
            }

            $appSlug = $application->slug;
            $permissionSuffixes = [
                'view-application-',
                'edit-application-',
                'delete-application-',
                'create-env-variables-',
                'edit-env-variables-',
                'delete-env-variables-',
                'create-development-',
                'create-staging-',
                'create-production-',
                'edit-env-values-',
            ];
            $permissionsToDelete = [];
            foreach ($permissionSuffixes as $suffix) {
                $permissionName = $suffix . $appSlug;
                $permission = \Spatie\Permission\Models\Permission::where('name', $permissionName)->first();

                if ($permission) {
                    $usersWithPermission = $permission->users;
                    foreach ($usersWithPermission as $permUser) {
                        $permUser->revokePermissionTo($permissionName);
                    }
                    $permissionsToDelete[] = $permission->id;
                }
            }
            $application->delete();
            if (!empty($permissionsToDelete)) {
                \Spatie\Permission\Models\Permission::whereIn('id', $permissionsToDelete)->delete();
            }

            DB::commit();

            Log::info('Application deleted successfully with all related permissions', [
                'application_id' => $application->id,
                'application_slug' => $appSlug,
                'user_id' => Auth::id(),
            ]);

            return redirect()->route('applications.index')->with('success', 'Application deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to delete application: ' . $e->getMessage(), [
                'application_id' => $application->id,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Failed to delete application: ' . $e->getMessage());
        }
    }

    public function history(Application $application, EnvVariable $envVariable)
    {
        $this->authorize('view-env-value-changes');
        $envVariable->load(['envValues', 'envValues.accessKey', 'envValues.accessKey.envType']);
        $envValueChanges = EnvValueChange::whereHas('envValue', function ($query) use ($envVariable) {
            $query->where('env_variable_id', $envVariable->id);
        })->with(['user', 'envValue.accessKey.envType'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard/Applications/History', [
            'application' => $application,
            'envVariable' => $envVariable,
            'envValueChanges' => $envValueChanges,
        ]);
    }

    public function createEnvVariables(Application $application)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->can('create-env-variables') && !$user->can('create-env-variables', $application->slug)) {
            return Redirect::route('applications.show', $application)->with('error', 'You do not have permission to create environment variables for this application.');
        }
        $canCreateDevelopment = $user->can('create-development');
        $canCreateStaging = $user->can('create-staging');
        $canCreateProduction = $user->can('create-production');
        return Inertia::render('Dashboard/Applications/EnvVariables/Create', [
            'application' => $application,
            'canCreateDevelopment' => $canCreateDevelopment,
            'canCreateStaging' => $canCreateStaging,
            'canCreateProduction' => $canCreateProduction,
        ]);
    }

    public function storeEnvVariables(StoreEnvVariableRequest $request, Application $application)
    {
        $validatedData = $request->validated();

        try {
            DB::beginTransaction();
            $lastSequence = EnvVariable::where('application_id', $validatedData['application_id'])
                ->max('sequence') ?? 0;

            $nextSequence = $lastSequence + 1;

            $envVariable = EnvVariable::create([
                'name' => $validatedData['name'],
                'application_id' => $validatedData['application_id'],
                'sequence' => $nextSequence, // Auto-assign the next sequence number
            ]);

            $accessKeys = $application->accessKeys;

            $envTypeMap = [
                'production_value' => 'Production',
                'staging_value' => 'Staging',
                'development_value' => 'Development',
            ];

            foreach ($accessKeys as $accessKey) {
                $envTypeName = $accessKey->envType->name ?? null;
                $valueKey = array_search($envTypeName, $envTypeMap);
                $value = '';
                if ($valueKey && isset($validatedData[$valueKey])) {
                    $value = $validatedData[$valueKey];
                }

                $envValue = EnvValue::create([
                    'env_variable_id' => $envVariable->id,
                    'access_key_id' => $accessKey->id,
                    'value' => $value,
                ]);

                // Record the change
                $envValueChange = EnvValueChange::create([
                    'env_value_id' => $envValue->id,
                    'user_id' => Auth::id(),
                    'old_value' => null,
                    'new_value' => $value ?: null,
                    'type' => 'create',
                ]);

                Log::info('Env value created successfully', [
                    'application_id' => $application->id,
                    'env_variable_id' => $envVariable->id,
                    'access_key_id' => $accessKey->id,
                    'env_value_id' => $envValue->id,
                    'env_value_change_id' => $envValueChange->id,
                    'user_id' => Auth::id(),
                ]);
            }

            $application->updateHealth();

            Log::info('Env variable created successfully', [
                'application_id' => $application->id,
                'env_variable_id' => $envVariable->id,
                'user_id' => Auth::id(),
            ]);

            DB::commit();

            return redirect()->route('applications.show', $application)
                ->with('success', 'Env variable created successfully!');
        } catch (\Exception $e) {
            // Rollback the transaction if any error occurs
            DB::rollBack();

            Log::error('Failed to create env variable: ' . $e->getMessage(), [
                'request' => $request->all(),
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Failed to create env variable: ' . $e->getMessage());
        }
    }

    public function editEnvVariables(Application $application, EnvVariable $envVariable)
    {
        //
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->can('edit-env-variables') && !$user->can('edit-env-variables', $application->slug)) {
            return Redirect::route('applications.show', $application)->with('error', 'You do not have permission to edit environment variables for this application.');
        }
        return Inertia::render('Dashboard/Applications/EnvVariables/Edit', [
            'application' => $application,
            'envVariable' => $envVariable,
        ]);
    }

    public function updateEnvVariables(UpdateEnvVariableRequest $request, Application $application, EnvVariable $envVariable)
    {
        $validatedData = $request->validated();

        try {
            DB::beginTransaction();
            $oldSequence = $envVariable->sequence;
            $newSequence = isset($validatedData['sequence']) ? (int)$validatedData['sequence'] : $oldSequence;
            $newSequence = max(1, $newSequence);

            if ($oldSequence != $newSequence) {
                $swapVariable = EnvVariable::where('application_id', $application->id)
                    ->where('sequence', $newSequence)
                    ->first();

                if ($swapVariable) {
                    $swapVariable->update([
                        'sequence' => $oldSequence
                    ]);
                }
            }

            $envVariable->update([
                'name' => $validatedData['name'],
                'sequence' => $newSequence,
            ]);

            DB::commit();

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Env variable updated successfully!'
                ]);
            }

            return redirect()->route('applications.show', $application)
                ->with('success', 'Env variable updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to update env variable: ' . $e->getMessage(), [
                'request' => $request->all(),
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update env variable: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Failed to update env variable: ' . $e->getMessage());
        }
    }


    public function destroyEnvVariables(Application $application, EnvVariable $envVariable)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->can('delete-env-variables') && !$user->can('delete-env-variables', $application->slug)) {
            return redirect()->back()->with('error', 'You do not have permission to delete environment variables for this application.');
        }
        try {
            DB::beginTransaction();
            $deletedSequence = $envVariable->sequence;
            $envVariable->delete();
            EnvVariable::where('application_id', $application->id)
                ->where('sequence', '>', $deletedSequence)
                ->orderBy('sequence')
                ->get()
                ->each(function ($env, $index) use ($deletedSequence) {
                    $env->sequence = $deletedSequence + $index;
                    $env->save();
                });

            DB::commit();

            return redirect()->back()
                ->with('success', 'Environment variable deleted successfully! Sequences have been updated.');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to delete environment variable: ' . $e->getMessage(), [
                'env_variable_id' => $envVariable->id,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()
                ->with('error', 'Failed to delete environment variable: ' . $e->getMessage());
        }
    }

    public function updateEnvValue(Request $request, Application $application, EnvValue $envValue)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->can('edit-env-values') && !$user->can('edit-env-values', $application->slug)) {
            return redirect()->back()->with('error', 'You do not have permission to edit environment values for this application.');
        }
        $validated = $request->validate([
            'value' => 'nullable|string',
        ]);
        EnvValueChange::create([
            'env_value_id' => $envValue->id,
            'user_id' => Auth::id(),
            'old_value' => $envValue->value,
            'new_value' => $validated['value'],
            'type' => 'update',
        ]);

        // Update the environment value
        $envValue->update([
            'value' => $validated['value'],
        ]);
        // Update the health of the application
        $application->updateHealth();

        return Redirect::back()->with('success', 'Env value updated successfully!');
    }


    /**
     * Helper method to create permission if it doesn't exist
     */
    private function createPermissionIfNotExists(string $permissionName)
    {
        if (!\Spatie\Permission\Models\Permission::where('name', $permissionName)->exists()) {
            \Spatie\Permission\Models\Permission::create(['name' => $permissionName]);
        }
    }

    /**
     * Generate a token for downloading environment variables
     */
    public function getDownloadToken(Application $application)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $tokenName = 'env-download-' . $application->slug;
        $user->tokens()->where('name', $tokenName)->delete();
        $token = $user->createToken($tokenName)->plainTextToken;
        $plainToken = explode('|', $token)[1];
        return response()->json(['token' => $plainToken]);
    }
}
